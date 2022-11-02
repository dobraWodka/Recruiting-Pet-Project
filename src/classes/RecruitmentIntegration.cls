/**
 * Created by yurii.bubis on 10/17/2022.
 */

public with sharing class RecruitmentIntegration {
    public static String returnAccessToken() {
        Customer_Secret_Info__mdt customerInfo = [
                SELECT
                        MasterLabel, Consumer_Key__c, Consumer_Secret__c, Password__c, Endpoint__c, Username__c
                FROM
                        Customer_Secret_Info__mdt
                WHERE MasterLabel = 'Recruitment Integration'
        ];
        if (customerInfo.Username__c == null) return null;

        String consumerKey = customerInfo.Consumer_Key__c;
        String consumerSecret = customerInfo.Consumer_Secret__c;
        String endpoint = customerInfo.Endpoint__c;
        String username = customerInfo.Username__c;
        String password = customerInfo.Password__c;
        String reqBody =
                'grant_type=password&client_id=' + consumerKey + '&client_secret='
                        + consumerSecret + '&username=' + username + '&password=' + password;

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setBody(reqBody);
        request.setMethod('GET');
        request.setEndpoint(endpoint);

        DeserializeResponse deResp = new DeserializeResponse();
        HttpResponse response = http.send(request);
        if (response.getStatus() == 'OK') {
            deResp = deResp.parse(response.getBody());
        }

        return deResp.access_token;
    }

    @future(callout=true)
    public static void sendCandidates(Set<Id> candidateIds) {
        List<Candidate__c> candidates = [
                SELECT
                        Name, Age__c, Email__c, Phone__c, Position_Name__c,
                        (SELECT Id, Position__c, Candidate__c, Position__r.Recruitment_Id__c
                        FROM Position_Candidates__r)
                FROM
                        Candidate__c
                WHERE
                        Id
                IN :candidateIds
        ];
//
        List<String> body = new List<String>();
        for (Candidate__c can : candidates) {
            String candidateObj = '{"candidate": ' + JSON.serialize(can)
                    + ', "image": ' + getContentVersion(can.Id) +
                    ', "positions": ' + returnPositionsIds(can.Position_Candidates__r) + ' }';
            body.add(candidateObj);
        }

        String accessToken = RecruitmentIntegration.ReturnAccessToken();
        if (accessToken != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setHeader('Authorization', 'Bearer ' + accessToken);
            request.setHeader('Content-Type', 'application/json');
            request.setEndpoint('https://cunning-unicorn-luyqex-dev-ed.my.salesforce.com/services/apexrest/CompanyData');
            request.setMethod('POST');
            request.setBody(JSON.serialize(body));

            try {
                HttpResponse response = http.send(request);
                System.debug(response.getBody());
            } catch (Exception e) {
                System.debug('Error occured' + e);
            }
        }
    }

    public static String returnPositionsIds(List<Position_Candidate__c> positionCandidates) {
        Set<Id> positionIds = new Set<Id>();
        for (Position_Candidate__c posCan : positionCandidates) {
            positionIds.add(posCan.Position__r.Recruitment_Id__c);
        }
        String positionIdsJson = JSON.serialize(positionIds);
        return positionIdsJson;
    }

    public static String getContentVersion(Id candidateId) {
        ContentDocumentLink cdl = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :candidateId LIMIT 1];
        ContentVersion contentVersion = [
                SELECT
                        Title, VersionData, FileExtension, FileType, PathOnClient, ContentLocation
                FROM
                        ContentVersion
                WHERE
                        ContentDocumentId = :cdl.ContentDocumentId
                LIMIT 1
        ];
        Blob dataBlob = contentVersion.VersionData;

        if (contentVersion.Title != null && contentVersion.Title != '') {

            String body = '{"PathOnClient": "' + contentVersion.PathOnClient + '",'
                    + '"Title": "' + contentVersion.Title + '" , "VersionData": "'
                    + EncodingUtil.base64Encode(dataBlob) + '" }';
            return body;
        } else {
            return null;
        }

    }


    class DeserializeResponse {

        public String access_token;
        public String instance_url;
        public String id;
        public String token_type;
        public String issued_at;
        public String signature;

        public DeserializeResponse parse(String json) {
            return (DeserializeResponse) System.JSON.deserialize(json, DeserializeResponse.class);
        }
    }
}