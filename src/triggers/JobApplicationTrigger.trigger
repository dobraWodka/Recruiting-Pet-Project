/**
 * Created by yurii.bubis on 10/19/2022.
 */

trigger JobApplicationTrigger on Candidate__c (after insert) {
    RecruitmentIntegration.sendCandidates(Trigger.newMap.keySet());
}