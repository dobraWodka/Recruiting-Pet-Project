/**
 * Created by yurii.bubis on 10/28/2022.
 */

import {api, LightningElement, wire, track} from 'lwc';
import getPositionsList from '@salesforce/apex/JobApplicationHelper.getPositionsList';
import getPositionsCount from '@salesforce/apex/JobApplicationHelper.getPositionsCount';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener} from "c/pubsub";

export default class SearchBar extends LightningElement {
    searchKey;
    isSearchChangeExecuted
    maxPostedDate;
    minSalaryValue;
    today;
    maxSalaryValue = 1000;
    startSalaryValue = 100;
    @api pagesize;
    @api currentpage;
    // @api pagenumber;
    totalrecords;
    totalpages;
    isSearchChangeExecuted = false;
    localCurrentPage = null;
    @wire(CurrentPageReference) pageRef;


    get minSalary() {
        return this.minSalaryValue ?? this.startSalaryValue;
    }

    connectedCallback() {
        registerListener("page", this.handlePage, this);
        let rightNow = new Date();
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );
        this.today = rightNow.toISOString().slice(0,10);
        this.maxPostedDate = new Date("2000-01-01");
    }
    handlePage(event) {
        console.log("currentpage in searchBar", event);
        this.currentpage = event;
        this.getCount();
    }
    renderedCallback() {
        console.log("searchKey in searchBar", this.searchKey);

        if (this.isSearchChangeExecuted && (this.localCurrentPage === this.currentpage)) {
            return;
        }
        this.isSearchChangeExecuted = true;
        this.localCurrentPage = this.currentpage;
        console.log("executing apex methods");
        this.getCount();

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
                    // this.dispatchRecordLoadEvent(recordsCount)
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
                // console.log("All Positions", this.allPositions);
                this.error = undefined;
                fireEvent(this.pageRef, "search", {
                    allPositions: this.allPositions,
                    recordsCount: this.totalrecords,
                    currentPage: this.currentpage,
                    pagesize: this.pagesize
                });
                this.currentpage = 1;
            })
            .catch(error => {
                this.error = error;
                this.allPositions = undefined;
            });
    }

    handleSearchChange(event) {
        if (this.searchKey !== event.target.value) {
            this.isSearchChangeExecuted = false;
            this.searchKey = event.target.value;
            this.currentpage = 1;
            // console.log("Current searchWord ", this.searchKey);
        }

    }
    handleSliderChange(event) {
        this.minSalaryValue = event.detail.value;
    }
    handleDateChange(event) {
        let newMaxPostedDate = new Date(event.detail.value);
        this.maxPostedDate = newMaxPostedDate;
    }
}