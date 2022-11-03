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
            ContentDistribution cdl = new ContentDistribution();
            cdl.ContentVersionId = [
                    SELECT Id, Title, ContentDocumentId
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :lstConDocs
                    LIMIT 1
            ].Id;
            cdl.Name = 'PublicShare';
            insert cdl;
            String cd = [
                    SELECT DistributionPublicUrl, ContentDownloadUrl
                    FROM ContentDistribution
                    WHERE Id = :cdl.Id
                    LIMIT 1
            ].ContentDownloadUrl;
            System.debug(cd);
            return cd;
        } else {
            return null;
        }
    }
}