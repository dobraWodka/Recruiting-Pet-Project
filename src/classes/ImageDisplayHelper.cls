/**
 * Created by yurii.bubis on 11/3/2022.
 */

public with sharing class ImageDisplayHelper {
    @AuraEnabled
    public static String setImageUrl(Id recordId) {
        List<Id> lstConDocs = new List<Id>();
        for (ContentDocumentLink cntLink : [
                Select Id, ContentDocumentId
                From ContentDocumentLink
                Where LinkedEntityId = :recordId
        ]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if (!lstConDocs.isEmpty()) {
            try {
                String contentVersionId = [
                        SELECT Id, Title, ContentDocumentId
                        FROM ContentVersion
                        WHERE ContentDocumentId IN :lstConDocs
                        LIMIT 1
                ].Id;
                String contentDownloadUrl = [
                        SELECT Id, ContentDownloadUrl
                        FROM  ContentDistribution
                        WHERE ContentVersionId = :contentVersionId
                ].ContentDownloadUrl;
                return contentDownloadUrl;
            } catch (QueryException ex) {
                System.debug('Creating New Content Distribution');
                ContentDistribution cdl = new ContentDistribution();
                cdl.ContentVersionId = [
                        SELECT Id, Title, ContentDocumentId
                        FROM ContentVersion
                        WHERE ContentDocumentId IN :lstConDocs
                        LIMIT 1
                ].Id;
                cdl.Name = 'PublicShare1';
                try {
                    Database.SaveResult result = Database.insert(cdl);
                    System.debug(result);
                } catch (DmlException e) {
                    System.debug('Dml Exception occurred: ' + e);
                }
                String cd = [
                        SELECT DistributionPublicUrl, ContentDownloadUrl
                        FROM ContentDistribution
                        WHERE Id = :cdl.Id
                        LIMIT 1
                ].ContentDownloadUrl;
                System.debug(cd);
                return cd;
            }
        } else {
            return null;
        }
    }
}