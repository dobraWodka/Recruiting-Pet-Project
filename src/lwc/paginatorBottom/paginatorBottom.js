/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {LightningElement, api, wire} from 'lwc';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";

export default class PaginatorBottom extends LightningElement {
    // Api considered as a reactive public property.
    pagesize;
    totalrecords;
    currentpage;
    page = 1;

    @wire(CurrentPageReference) pageRef;

    // Following are the private properties to a class.
    lastpage = false;
    firstpage = false;
    // getter
    get totalPages() {
        return Math.ceil(this.totalrecords / this.pagesize);
    }
    get showFirstButton() {
        if (this.currentpage === 1) {
            return true;
        }
        return false;
    }
    // getter
    get showLastButton() {
        if (Math.ceil(this.totalrecords / this.pagesize) === this.currentpage) {
            return true;
        }
        return false;
    }
    connectedCallback() {
        registerListener("search", this.handleSearch, this);
    }
    handleSearch(event) {
        this.totalrecords = event.recordsCount;
        this.currentpage = event.currentPage;
        this.pagesize = event.pagesize;
    }
    //Fire events based on the button actions
    handlePrevious() {
        // this.dispatchEvent(new CustomEvent('previous'));
        if (this.page > 1) {
            this.page = this.page - 1;
        }
        this.firePageEvent()
        console.log("previous Event page", this.page);
    }
    handleNext() {
        // this.dispatchEvent(new CustomEvent('next'));
        if (this.page < this.totalPages) {
            this.page = this.page + 1;
        }
        this.firePageEvent()
        console.log("next Event page ", this.page);
    }
    handleFirst() {
        // this.dispatchEvent(new CustomEvent('first'));
        this.page = 1;
        this.firePageEvent()
    }
    handleLast() {
        // this.dispatchEvent(new CustomEvent('last'));
        this.page = this.totalPages;
        this.firePageEvent()
    }
    firePageEvent() {
        fireEvent(this.pageRef, "page", this.page);
    }

}