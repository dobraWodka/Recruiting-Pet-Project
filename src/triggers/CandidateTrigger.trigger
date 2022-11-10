/**
 * Created by yurii.bubis on 10/19/2022.
 */

trigger CandidateTrigger on Candidate__c (after insert) {
    Map<String, Candidate__c> candidates = new Map<String, Candidate__c>();

    for (Candidate__c can : Trigger.new) {
        if (can.Email__c != null) {
            candidates.put(can.Email__c, can);
        }
    }
    CandidateTriggerHelper.sendCandidateEmail(candidates);

}