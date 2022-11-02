/**
 * Created by yurii.bubis on 11/1/2022.
 */

public with sharing class JobApplicationHelper {
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

    @AuraEnabled
    public static String processApplication(String candidateJson, String imageJson, String selectedPositionsIds) {
        String savedRecordId = saveCandidate(candidateJson);
        String savedImageId = saveContentVersion(imageJson, savedRecordId);
        createJunctionObjects(selectedPositionsIds, savedRecordId);

        return 'Alles gut!';
    }

    private static Id saveCandidate(String candidateJson) {
        Candidate__c can = (Candidate__c) JSON.deserialize(candidateJson, Candidate__c.class);
        Database.SaveResult result = Database.insert(can);

        return result.id;
    }
    private static Id saveContentVersion(String imageJson, Id relatedRecordId) {
        Map<String, Object> imageMap = (Map<String, Object>) JSON.deserializeUntyped(imageJson);
        String imageString = EncodingUtil.urlDecode(imageMap.get('base64').toString(), 'UTF-8');

        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = EncodingUtil.base64Decode(imageString) ;
        contentVersion.Title = imageMap.get('fileName').toString();
        contentVersion.ContentLocation = 's';
        contentVersion.PathOnClient = '.jpg';
        contentVersion.FirstPublishLocationId = relatedRecordId;
        Database.SaveResult result = Database.insert(contentVersion);

        return result.id;
    }

    private static void createJunctionObjects(String selectedPositionsIds, Id candidateId) {
        List<Id> ids = (List<Id>) JSON.deserialize(selectedPositionsIds, List<Id>.class);
        List<Position_Candidate__c> positionCandidates = new List<Position_Candidate__c>();

        if (candidateId != null){
            for (Id positionId : ids) {
                Position_Candidate__c positionCandidate = new Position_Candidate__c(
                        Position__c = positionId,
                        Candidate__c = candidateId
                );
                positionCandidates.add(positionCandidate);
            }
        }
        try {
            List<Database.SaveResult> result = Database.insert(positionCandidates);
            System.debug(result.size());
        } catch (Exception e) {
            System.debug('Error occured' + e);
        }

    }
}