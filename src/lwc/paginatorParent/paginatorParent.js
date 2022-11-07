/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {LightningElement, track, wire} from 'lwc';
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";


export default class PaginatorParent extends LightningElement {
    @track error;
    @track allPositions;
    selectedPositions = [];
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener("removeposition", this.handleAddSelected, this);
        registerListener("search", this.handleSearch, this);

    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleSearch(event) {
        this.allPositions = event.allPositions;
    }

    sendSelected() {
        fireEvent(this.pageRef, "addposition", this.selectedPositions);

    }
    handleAddSelected(event) {
        const position = event.detail;
        if (!this.selectedPositions.includes(position)) {
            this.selectedPositions = [...this.selectedPositions, position];
        } else {
            this.selectedPositions = this.selectedPositions.filter(item => item !== position);
        }
        this.sendSelected();
    }
}