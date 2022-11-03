/**
 * Created by yurii.bubis on 11/3/2022.
 */

public with sharing class PositionRestWrapper {

    public List<Candidate__c> candidates {get;set;}
    public Map<Id, List<Position__c>> relatedPositions {get;set;}
    public Map<Id, ContentVersion> image {get;set;}
}
