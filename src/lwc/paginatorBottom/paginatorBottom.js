/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {LightningElement, wire} from 'lwc';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";
import First from "@salesforce/label/c.First";
import Previous from "@salesforce/label/c.Previous";
import Next from "@salesforce/label/c.Next";
import Last from "@salesforce/label/c.Last";
import Total_records from "@salesforce/label/c.Total_records";
import Page from "@salesforce/label/c.Page";
import Of from "@salesforce/label/c.Of";

export default class PaginatorBottom extends LightningElement {
    totalRecords;
    pageSize;
    page = 1;
    firstLabel = First;
    previousLabel = Previous;
    nextLabel = Next;
    lastLabel = Last;
    totalRecordsLabel = Total_records;
    pageLabel = Page;
    ofLabel = Of;


    @wire(CurrentPageReference) pageRef;

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get showFirstButton() {
        if (this.page === 1) {
            return true;
        }
        return false;
    }

    get showLastButton() {
        if (Math.ceil(this.totalRecords / this.pageSize) === this.page) {
            return true;
        }
        return false;
    }

    connectedCallback() {
        registerListener("search", this.handleSearch, this);
    }

    handleSearch(event) {
        this.totalRecords = event.recordsCount;
        this.page = event.currentPage;
        this.pageSize = event.pageSize;
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