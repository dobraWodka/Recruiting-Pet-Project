/**
 * Created by yurii.bubis on 10/21/2022.
 */

import {LightningElement, api} from 'lwc';

export default class JobPositionTile extends LightningElement {

    @api position
    @api showDetails;
    @api detailIsExpanded;
    selectedPositionList;
    detailWillRemain;
    utilityRecordFields = ["Id", "Salary__c", "Name"];


    selectedPositionHandler(event) {
        event.preventDefault();
        this.showDetails === true ? this.showDetails = false : this.showDetails = true;
        console.log("show details after event", this.showDetails);
        this.selectedPositionList = [];
        // const selectedPositionId = event.detail.Id;
        // this.selectedPosition = this.allPositions.find(position => position.Id === selectedPositionId);
        Object.keys(this.position).forEach(positionKey => {
            if (!this.utilityRecordFields.includes(positionKey)) {
            const cleanKey = positionKey.replace(/(__c|_)/g, " ") + ":";
            const newObj = {
                "key": cleanKey,
                "value": this.position[positionKey]
            }
            this.selectedPositionList.push(newObj);
            // console.log("selectedPostionList size is ", this.selectedPositionList.length);
            }
        });

        const selectedEvent = new CustomEvent("selectedposition", {
            detail: {
                Id: this.position.Id,
            }
        });
        this.dispatchEvent(selectedEvent);
    }
    addPositionToSelected() {
        this.dispatchEvent(new CustomEvent('apply', {
            detail: this.position
        }));

    }
}