/**
 * Created by yurii.bubis on 10/17/2022.
 */

@RestResource(UrlMapping='/CompanyData/*')
global with sharing class PositionRestController {
    @HttpGet
    global static List<Position__c> getPositions() {
        List<Position__c> positions = [
                SELECT
                        Name, Salary__c, Required_Skills__c, HR_Name__c, Description__c, CreatedDate, Responsibilities__c
                FROM
                        Position__c
        ];
        System.debug(positions);
        return positions;
    }
    @HttpPost
    global static void insertPositions() {
        String requestBody = RestContext.request.requestBody.toString();

        List<String> bodyList = (List<String>) JSON.deserialize(requestBody, List<String>.class);

        PositionRestWrapper wrapper = PositionRestHelper.deserializeJSONIntoMaps(bodyList);

        List<Candidate__c> insertedCandidates = PositionRestHelper.insertCandidatesAndReturnWithId(wrapper.candidates);

        PositionRestHelper.insertContentVersion(insertedCandidates, wrapper.image);
        PositionRestHelper.insertPositionCandidates(insertedCandidates, wrapper.relatedPositions);

    }

}

