/**
 * Created by yurii.bubis on 10/17/2022.
 */

@RestResource(UrlMapping='/CompanyData/*')
global with sharing class PositionRestController {
    @HttpGet
    global static List<Position__c> getPositions() {
        List<Position__c> positions = [
                SELECT
                        Name, Salary__c, Required_Skills__c, HR_Name__c, Description__c, CreatedDate, Responsibilities__c
                FROM
                        Position__c
        ];
        System.debug(positions);
        return positions;
    }
    @HttpPost
    global static void insertPositions() {
        String requestBody = RestContext.request.requestBody.toString();

        List<String> bodyList = (List<String>) JSON.deserialize(requestBody, List<String>.class);

        List<Candidate__c> candidatesToInsert = new List<Candidate__c>();
        Map<Id, List<Position__c>> candidatePostitionMap = new Map<Id, List<Position__c>>();
        Map<Id, ContentVersion> candidateToImage = new Map<Id, ContentVersion>();

        for (String candidateObj : bodyList) {
            Map<String, Object> request = (Map<String, Object>) JSON.deserializeUntyped(candidateObj);

            Map<String, Object> candidateRelated = (Map<String, Object>) request.get('candidate');
            candidateRelated.remove('Position_Candidates__r');

            String candidateString = JSON.serialize(candidateRelated);
            String imageJson = JSON.serialize(request.get('image'));
            String positionIdsJson = JSON.serialize(request.get('positions'));

            Candidate__c candidate = deserializeCandidate(candidateString);
            candidatesToInsert.add(candidate);

            List<Position__c> relatedPositions = deserializePosition(positionIdsJson);
            candidatePostitionMap.put(candidate.Communities_Org_Id__c, relatedPositions);

            ContentVersion cv = deserializeContentVersion(imageJson);
            candidateToImage.put(candidate.Communities_Org_Id__c, cv);
        }

        List<Database.SaveResult> results = Database.insert(candidatesToInsert, false);
        Set<Id> insertedCandidateIds = new Set<Id>();

        for (Database.SaveResult result : results) {
            insertedCandidateIds.add(result.id);
        }
        List<Candidate__c> insertedCandidates = [
                SELECT Id, Name, Communities_Org_Id__c
                FROM Candidate__c
                WHERE Id IN :insertedCandidateIds
        ];

        List<Positon_Candidate__c> positonCandidatesToInsert = new List<Positon_Candidate__c>();
        List<ContentVersion> contentVersionsToInsert = new List<ContentVersion>();
        for (Candidate__c can : insertedCandidates) {

            ContentVersion cv = candidateToImage.get(can.Communities_Org_Id__c);
            cv.FirstPublishLocationId = can.Id;
            contentVersionsToInsert.add(cv);

            for (Position__c position : candidatePostitionMap.get(can.Communities_Org_Id__c)) {
                Positon_Candidate__c posCan = new Positon_Candidate__c(
                        Name = can.Name + 'for position ' + position.Name,
                        Candidate__c = can.Id,
                        Position__c = position.Id
                );
                positonCandidatesToInsert.add(posCan);
            }
        }
        insert positonCandidatesToInsert;
        insert contentVersionsToInsert;
    }

    private static Candidate__c deserializeCandidate(String candidateJson) {

        Candidate__c candidate = (Candidate__c) JSON.deserialize(candidateJson, Candidate__c.class);
        candidate.Communities_Org_Id__c = candidate.Id;
        candidate.Id = null;

        return candidate;
    }
    private static ContentVersion deserializeContentVersion(String imageJson) {
        Map<String, Object> imageJsonMap = (Map<String, Object>) JSON.deserializeUntyped(imageJson);

        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = EncodingUtil.base64Decode(imageJsonMap.get('VersionData').toString());
        contentVersion.Title = imageJsonMap.get('Title').toString();
        contentVersion.ContentLocation = 's';
        contentVersion.PathOnClient = imageJsonMap.get('PathOnClient').toString();
//        contentVersion.FirstPublishLocationId = candidateId;

        return contentVersion;

    }
    private static List<Position__c> deserializePosition(String positionIdsJson) {
        List<Id> positionIds = (List<Id>) JSON.deserialize(positionIdsJson, List<String>.class);
        List<Position__c> positions = [SELECT Name FROM Position__c WHERE Id IN :positionIds];
        return positions;
    }
}

