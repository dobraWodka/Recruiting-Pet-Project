/**
 * Created by yurii.bubis on 11/3/2022.
 */

public with sharing class PositionRestHelper {
    public static PositionRestWrapper deserializeJSONIntoMaps(List<String> bodyList) {
        List<Candidate__c> candidatesToInsert = new List<Candidate__c>();
        Map<Id, List<Position__c>> candidatePositionMap = new Map<Id, List<Position__c>>();
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
            candidatePositionMap.put(candidate.Communities_Org_Id__c, relatedPositions);

            ContentVersion cv = deserializeContentVersion(imageJson);
            candidateToImage.put(candidate.Communities_Org_Id__c, cv);
        }
        PositionRestWrapper wrapper = new PositionRestWrapper();
        wrapper.candidates = candidatesToInsert;
        wrapper.image = candidateToImage;
        wrapper.relatedPositions = candidatePositionMap;

        return wrapper;
    }
    public static List<Candidate__c> insertCandidatesAndReturnWithId(List<Candidate__c> candidatesToInsert) {
        List<Database.SaveResult> results = Database.insert(candidatesToInsert, false);
        Set<Id> insertedCandidateIds = new Set<Id>();

        for (Database.SaveResult result : results) {
            insertedCandidateIds.add(result.id);
        }
        if (!insertedCandidateIds.isEmpty()){
            try {
                return [
                        SELECT Id, Name, Communities_Org_Id__c
                        FROM Candidate__c
                        WHERE Id IN :insertedCandidateIds
                ];
            } catch (QueryException e ) {
                System.debug(e);
                return null;
            }
        } else {
            return null;
        }
    }
    public static void insertPositionCandidates(List<Candidate__c> candidates,
            Map<Id, List<Position__c>> candidateIdToRelatedPositions) {
        List<Position_Candidate__c> positionCandidatesToInsert = new List<Position_Candidate__c>();

        for (Candidate__c can : candidates) {
            for (Position__c position : candidateIdToRelatedPositions.get(can.Communities_Org_Id__c)) {
                Position_Candidate__c posCan = new Position_Candidate__c(
                        Name = can.Name + 'for position ' + position.Name,
                        Candidate__c = can.Id,
                        Position__c = position.Id
                );
                positionCandidatesToInsert.add(posCan);
            }
        }
        if (positionCandidatesToInsert.size() > 0) {
            try {
                insert positionCandidatesToInsert;
            } catch (DmlException e) {
                System.debug(e);
            }
        }
    }

    public static void insertContentVersion(List<Candidate__c> candidates,
            Map<Id, ContentVersion> candidateToImage) {
        List<ContentVersion> contentVersionsToInsert = new List<ContentVersion>();

        for (Candidate__c can : candidates) {
            ContentVersion cv = candidateToImage.get(can.Communities_Org_Id__c);
            cv.FirstPublishLocationId = can.Id;
            contentVersionsToInsert.add(cv);
        }
        if (!contentVersionsToInsert.isEmpty()) {
            insert contentVersionsToInsert;
        }
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

        return contentVersion;

    }
    private static List<Position__c> deserializePosition(String positionIdsJson) {
        List<Id> positionIds = (List<Id>) JSON.deserialize(positionIdsJson, List<String>.class);
        try {
            List<Position__c> positions = [SELECT Name FROM Position__c WHERE Id IN :positionIds];
            return positions;
        } catch (QueryException e) {
            System.debug(e);
            return null;
        }
    }
}