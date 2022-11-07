/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {api, LightningElement, track, wire} from 'lwc';
import getPositionsList from '@salesforce/apex/JobApplicationHelper.getPositionsList';
import getPositionsCount from '@salesforce/apex/JobApplicationHelper.getPositionsCount';
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";


export default class PaginatorParent extends LightningElement {
    @track error;
    @track allPositions;
    @api pagesize;
    @api currentpage;
    @api searchKey;
    totalrecords;
    totalpages;
    isSearchChangeExecuted = false;
    localCurrentPage = null;
    @track showDetails;
    @track detailIsExpanded;
    @track minSalary;
    @track maxPostedDate = "1999-01-01T23:01:01Z";
    today;
    @track showAll = false;
    selectedPositions = [];
    @wire(CurrentPageReference) pageRef;

    handleSearchChange(event) {
        if (this.searchKey !== event.target.value) {
            this.isSearchChangeExecuted = false;
            this.searchKey = event.target.value;
            this.currentpage = 1;
        }
    }
    connectedCallback() {
        registerListener("removeposition", this.handleAddSelected, this);

        let rightNow = new Date();
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );
        this.today = rightNow.toISOString().slice(0, 10);
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
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

    renderedCallback() {
        if (this.isSearchChangeExecuted && (this.localCurrentPage === this.currentpage)) return

        this.isSearchChangeExecuted = true;
        this.localCurrentPage = this.currentpage;
        this.getCount();
    }
    handleSliderChange(event) {
        this.minSalary = event.detail.value;
    }

    handleDateChange(event) {
        this.maxPostedDate =`${event.detail.value}T00:00:00Z`;
    }

    handleSelectedPosition(event) {
        this.showAll = false;
    }

    getCount() {
        getPositionsCount({searchString: this.searchKey})
            .then(recordsCount => {
                this.totalrecords = recordsCount;
                if (recordsCount !== 0 && !isNaN(recordsCount)) {
                    this.totalpages = Math.ceil(recordsCount / this.pagesize);
                    this.getList();
                } else {
                    this.allPositions = [];
                    this.totalpages = 1;
                    this.totalrecords = 0;
                }
                this.dispatchRecordLoadEvent(recordsCount)
            })
            .catch(error => {
                this.error = error;
                this.totalrecords = undefined;
            })
    }

    getList() {
        getPositionsList({
            pagenumber: this.currentpage, numberOfRecords: this.totalrecords,
            pageSize: this.pagesize, searchString: this.searchKey,
            salary: this.minSalary,
            maxPostedDate: this.maxPostedDate
        })
            .then(positionList => {
                this.allPositions = positionList;
                console.log("All Positions", this.allPositions);
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.allPositions = undefined;
            });
    }
    dispatchRecordLoadEvent(recordsCount) {
        const event = new CustomEvent('recordsload', {
            detail: {
                totalrecords: recordsCount,
            }
        });
        this.dispatchEvent(event);
    }
}