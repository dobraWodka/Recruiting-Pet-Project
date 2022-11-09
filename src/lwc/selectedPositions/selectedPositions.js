/**
 * Created by yurii.bubis on 11/4/2022.
 */

import {LightningElement, track, wire} from 'lwc';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener} from "c/pubsub";
import Selected_positions from "@salesforce/label/c.Selected_positions";
import Submit_applications from "@salesforce/label/c.Submit_applications";



export default class SelectedPositions extends LightningElement {
    showModal
    showSubmitButton
    selectedPositionsLabel = Selected_positions;
    submitApplicationLabel = Submit_applications;
    @track selectedPositions = [];

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener("addposition", this.addPositions, this);
    }
    renderedCallback() {
       this.selectedPositions.length > 0 ? this.showSubmitButton = true : this.showSubmitButton = false;
    }

    addPositions(event) {
        this.selectedPositions = event;
    }

    sendPubSubEvent(event) {
        const position = this.selectedPositions.find(position => position.Id === event.currentTarget.dataset.id);
        fireEvent(this.pageRef, "removeposition", {detail: position});
    }
    submitApplication() {
        this.showModal = true;
    }

    handleModalClosed(event) {
        if (event.detail === true) this.selectedPositions = [];
        this.showModal = false;
        fireEvent(this.pageRef, "clearallpositions", true);
    }

}