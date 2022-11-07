/**
 * Created by yurii.bubis on 10/21/2022.
 */

import {LightningElement, api} from 'lwc';

export default class JobPositionTile extends LightningElement {

    @api position
    @api showDetails;
    @api detailIsExpanded;
    @api selectedPositionsList;
    positionDetails = [];
    buttonLabel;
    buttonVariant;
    utilityRecordFields = ["Id", "Salary__c", "Name"];

    renderedCallback() {
        console.log("selected positions in Tile", JSON.stringify(this.selectedPositionsList));
        if (this.selectedPositionsList.includes(this.position)) {
          this.buttonLabel = "Remove";
          this.buttonVariant = "destructive";
        } else {
            this.buttonLabel = "Add";
            this.buttonVariant = "brand";
        }
        // console.log("this.Position in rendered Callback", this.position);
    }

    selectedPositionHandler(event) {
        event.preventDefault();
        this.showDetails === true ? this.showDetails = false : this.showDetails = true;
        // this.showDetails = true;
        this.positionDetails = [];

        this.createPositionDetails(this.position);

        // const selectedEvent = new CustomEvent("selectedposition", {
        //     detail: this.position.Id,
        //
        // });
        // this.dispatchEvent(selectedEvent);
    }
    addPositionToSelected() {
        this.dispatchEvent(new CustomEvent('addtoselected', {
            detail: this.position
        }));

    }
    createPositionDetails(thisPosition) {
        // console.log("thisPosition in createPositionDetails", thisPosition);

        Object.keys(thisPosition).forEach(positionKey => {
            if (!this.utilityRecordFields.includes(positionKey)) {
                const cleanKey = positionKey.replace(/(__c|_)/g, " ") + ":";
                const newObj = {
                    "key": cleanKey,
                    "value": thisPosition[positionKey]
                }
                this.positionDetails.push(newObj);
            }
        });
    }
}