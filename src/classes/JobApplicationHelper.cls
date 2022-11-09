/**
 * Created by yurii.bubis on 11/1/2022.
 */

public with sharing class JobApplicationHelper {
    @AuraEnabled(Cacheable=true)
    public static List<Position__c> getPositionsList(Integer pageNumber, Integer pageSize,
            String searchString, Integer salary, String maxPostedDate) {
        String searchKey = '';
        if (searchString != null) searchKey = searchString;
        String query = 'select  Name, Salary__c, Description__c, Required_Skills__c, Responsibilities__c' +
                ' from Position__c where Name like \'%' + searchKey + '%\'';

        if (salary != null && salary != 0) {
            System.debug(salary);
            query += ' and Salary__c >= ' + salary;
        }
        if (maxPostedDate != null) {
            query += ' and CreatedDate > ' + maxPostedDate;
        }
        query += ' limit ' + pageSize + ' offset ' + (pageSize * (pageNumber - 1));

        try {
            List<Position__c> positions = Database.query(query);
            System.debug(positions);
            return positions;
        } catch (Exception e) {
            System.debug(e);
        }
        return null;
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getPositionsCount(String searchString, Integer salary, String maxPostedDate){
        String searchKey = '';
        if (searchString != null) searchKey = searchString;
        String query = 'select  COUNT()' +
                ' from Position__c where Name like \'%' + searchKey + '%\'';

        if (salary != null && salary != 0) {
            System.debug(salary);
            query += ' and Salary__c >= ' + salary;
        }
        if (maxPostedDate != null) {
            query += ' and CreatedDate > ' + maxPostedDate;
        }
        try {
            Integer count = Database.countQuery(query);
            System.debug(count);
            return count;
        } catch (Exception e) {
            System.debug(e);
        }
        return null;

    }

    @AuraEnabled
    public static void processApplication(String candidateJson, String imageJson, String selectedPositionsIds) {
        Savepoint savePoint = Database.setSavepoint();
        try {
            String savedRecordId = saveCandidate(candidateJson);
            saveContentVersion(imageJson, savedRecordId);
            createJunctionObjects(selectedPositionsIds, savedRecordId);
        } catch (Exception e) {
            System.debug('Unexpected error occurred ' + e);
            Database.rollback(savePoint);
        }
    }

    private static Id saveCandidate(String candidateJson) {
        Candidate__c can = (Candidate__c) JSON.deserialize(candidateJson, Candidate__c.class);
       try {
           Database.SaveResult result = Database.insert(can);
           return result.id;
       } catch (DmlException e) {
           System.debug(e);
           return null;
       }
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

        try {
            Database.SaveResult result = Database.insert(contentVersion);
            return result.id;
        } catch (DmlException e) {
            System.debug(e);
            return null;
        }
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
        } catch (DmlException e) {
            System.debug('Error occurred' + e);
        }

    }
}