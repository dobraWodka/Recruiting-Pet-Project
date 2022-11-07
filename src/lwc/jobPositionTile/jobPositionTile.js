/**
 * Created by yurii.bubis on 10/21/2022.
 */

import {LightningElement, api} from 'lwc';

export default class JobPositionTile extends LightningElement {
    @api position
    @api showDetails;
    @api selectedPositionsList;
    positionDetails = [];
    buttonLabel;
    buttonVariant;
    utilityRecordFields = ["Id", "Salary__c", "Name"];

    renderedCallback() {
        if (this.selectedPositionsList.includes(this.position)) {
          this.buttonLabel = "Remove from Selected Positions list";
          this.buttonVariant = "destructive";
        } else {
            this.buttonLabel = "Add to Selected Positions list";
            this.buttonVariant = "brand";
        }
    }

    selectedPositionHandler(event) {
        event.preventDefault();
        this.showDetails === true ? this.showDetails = false : this.showDetails = true;
        this.positionDetails = [];

        this.createPositionDetails(this.position);
    }

    addPositionToSelected() {
        this.dispatchEvent(new CustomEvent('addtoselected', {
            detail: this.position
        }));
    }
    createPositionDetails(thisPosition) {
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