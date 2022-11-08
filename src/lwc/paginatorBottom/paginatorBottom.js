/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {LightningElement, wire} from 'lwc';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";

export default class PaginatorBottom extends LightningElement {
    totalrecords;
    currentpage;
    pagesize;
    page = 1;

    @wire(CurrentPageReference) pageRef;

    get totalPages() {
        return Math.ceil(this.totalrecords / this.pagesize);
    }

    get showFirstButton() {
        if (this.currentpage === 1) {
            return true;
        }
        return false;
    }

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

    handlePrevious() {
        if (this.page > 1) {
            this.page = this.page - 1;
        }
        this.firePageEvent()
    }

    handleNext() {
        if (this.page < this.totalPages) {
            this.page = this.page + 1;
        }
        this.firePageEvent()
    }

    handleFirst() {
        this.page = 1;
        this.firePageEvent()
    }

    handleLast() {
        this.page = this.totalPages;
        this.firePageEvent()
    }

    firePageEvent() {
        fireEvent(this.pageRef, "page", this.page);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

}