/**
 * Created by yurii.bubis on 10/17/2022.
 */

public with sharing class RecruitmentIntegration {
    public static String returnAccessToken(){
        Customer_Secret_Info__mdt customerInfo = [
                SELECT
                        MasterLabel, Consumer_Key__c, Consumer_Secret__c, Password__c
                FROM
                        Customer_Secret_Info__mdt WHERE MasterLabel = 'Recruitment Integration' ];

        String consumerKey = customerInfo.Consumer_Key__c;
        String consumerSecret = customerInfo.Consumer_Secret__c;
        String endpoint = 'https://cunning-unicorn-luyqex-dev-ed.my.salesforce.com/services/oauth2/token';
        String username = 'yurabybis@cunning-unicorn-luyqex.com';
        String password = customerInfo.Password__c;
        String reqBody =
                'grant_type=password&client_id=' + consumerKey + '&client_secret='
                        + consumerSecret + '&username=' + username + '&password='+ password;

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
    @AuraEnabled(Cacheable=true)
    public static List<Position__c> getPositionsList(Integer pagenumber, Integer numberOfRecords, Integer pageSize, String searchString) {
        String searchKey = '%' + searchString + '%';

        String query = 'select  Name, Salary__c, Description__c, Required_Skills__c, Responsibilities__c from Position__c ';
        if (searchString != null && searchString != '') {
            query += 'where Name like \'%' + searchString + '%\' ';
        }
        query += ' limit ' + pageSize + ' offset ' + (pageSize * (pagenumber - 1));
        System.debug(query);
        return Database.query(query);
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getPositionsCount(String searchString){
        System.debug('Count method ' + searchString);
        String query = 'select count() from Position__c ';
        if (searchString != null && searchString != '') {
            query += 'where Name like \'%' + searchString + '%\'';
        }
        System.debug(query);
        return Database.countQuery(query);

    }

    @future(callout=true)
    public static void sendCandidates(Id candidatesId) {
        Candidate__c candidates = [
                SELECT
                        Name, Age__c, Email__c, Phone__c, Position_Name__c
                FROM
                        Candidate__c
                WHERE
                        Id = :candidatesId
                LIMIT 1
        ];
        String body  = '{"position": ' + JSON.serialize(candidates)
                + ', "image": '+ getContentVersion(candidates.Id) + '}';
        System.debug('positions count ' +  candidates);

        String accessToken = RecruitmentIntegration.ReturnAccessToken();

        if (accessToken != null) {
            System.debug('Access token provided');
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setHeader('Authorization','Bearer ' + accessToken);
            request.setHeader('Content-Type', 'application/json');
            request.setEndpoint('https://cunning-unicorn-luyqex-dev-ed.my.salesforce.com/services/apexrest/CompanyData');
            request.setMethod('POST');
            request.setBody(body);

            HttpResponse response = http.send(request);

            System.debug(response.getBody());
        }
    }

    public static String getContentVersion(Id candidateId) {
        ContentDocumentLink  a = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :candidateId LIMIT 1];
        ContentVersion contentVersion = [
                SELECT
                        Title, VersionData, FileExtension, FileType , PathOnClient, ContentLocation
                FROM
                        ContentVersion
                WHERE
                        ContentDocumentId = :a.ContentDocumentId
                LIMIT 1];
        Blob dataBlob = contentVersion.VersionData;
        String body = '{"PathOnClient": "' + contentVersion.PathOnClient + '",'
                + '"Title": "' + contentVersion.Title + '" , "VersionData": "'
                + EncodingUtil.base64Encode(dataBlob) + '" }';

//        String body = JSON.serialize(bodyJson);
        System.debug(body);

        return body;
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