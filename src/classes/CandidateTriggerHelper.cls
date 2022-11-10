/**
 * Created by yurii.bubis on 10/27/2022.
 */

public with sharing class CandidateTriggerHelper {

    public static void sendCandidateEmail(Map<String, Candidate__c> candidates) {
        System.debug('Inside sendCandidateEmail Method');
        EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Name = 'Recruitment'];
        System.debug(et);

        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        for (String email : candidates.keySet()) {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new List<String>{candidates.get(email).Email__c});
            mail.setTemplateId(et.Id);
            mail.setHtmlBody(et.HtmlValue);
            mail.setSubject(et.Subject);
            mail.setReplyTo('yurabybis@outlook.com');
            mail.setSenderDisplayName('Salesforce Support');
            mail.setSaveAsActivity(false);
            mail.setUseSignature(false);
            mails.add(mail);
        }
        try {
            List<Messaging.SendEmailResult> results = Messaging.sendEmail(mails,false);
            System.debug(results);
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
    }
}