/**
 * Created by yurii.bubis on 10/19/2022.
 */

public with sharing class JobApplication {
   @future(callout=true)
    public static void sendCandidated(Set<Id> candidatesIds) {
       List<Candidate__c> candidates = [
               SELECT
                       Name, Age__c, Email__c, Phone__c, Position_Name__c
               FROM
                       Candidate__c
               WHERE
                       Id IN :candidatesIds
       ];
       String candidatesJson = JSON.serialize(candidates);
       System.debug('positions count ' +  candidates);

       String accessToken = RecruitmentIntegration.ReturnAccessToken();

       if (accessToken != null) {
           Http http = new Http();
           HttpRequest request = new HttpRequest();
           request.setHeader('Authorization','Bearer ' + accessToken);
           request.setHeader('Content-Type', 'application/json');
           request.setEndpoint('https://cunning-unicorn-luyqex-dev-ed.my.salesforce.com/services/apexrest/CompanyData');
           request.setMethod('POST');
           request.setBody(candidatesJson);

           HttpResponse response = http.send(request);

           System.debug(response.getBody());
       }
   }
}