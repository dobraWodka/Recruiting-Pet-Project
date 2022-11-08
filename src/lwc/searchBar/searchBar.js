/**
 * Created by yurii.bubis on 10/28/2022.
 */

import {api, LightningElement, wire, track} from 'lwc';
import getPositionsList from '@salesforce/apex/JobApplicationHelper.getPositionsList';
import getPositionsCount from '@salesforce/apex/JobApplicationHelper.getPositionsCount';
import {CurrentPageReference} from "lightning/navigation";
import {fireEvent, registerListener, unregisterAllListeners} from "c/pubsub";

export default class SearchBar extends LightningElement {
    searchKey;
    maxPostedDate;
    minSalary;
    today;
    pagesize = 5;
    currentpage = 1;
    totalrecords;
    totalpages;
    @wire(CurrentPageReference) pageRef;

    get comboboxOptions() {
        return [
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
            { label: '10', value: '10' }
        ];
    }
    connectedCallback() {
        registerListener("page", this.handlePage, this);
        let rightNow = new Date();
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );
        this.today = rightNow.toISOString().slice(0,10);
        this.maxPostedDate = new Date("2000-01-01");
        this.performSearch();
    }

    handlePage(event) {
        this.currentpage = event;
        this.performSearch();
    }
    handleComboboxChange(event) {
        this.pagesize = event.detail.value;
        this.currentpage = 1;
        this.performSearch();
    }

    handleSearchChange(event) {
        if (this.searchKey !== event.target.value) {
            this.searchKey = event.target.value;
            this.currentpage = 1;
            this.performSearch(600);
        }
    }
    handleSliderChange(event) {
        this.minSalary = event.detail.value;
        this.currentpage = 1;
        this.performSearch(600);
    }
    handleDateChange(event) {
        this.maxPostedDate = new Date(event.detail.value);
        this.currentpage = 1;
        this.performSearch();
    }
    performSearch(delay = 0) {
        setTimeout(() => {
            this.getCount();
        }, delay);
    }
    getCount() {
        getPositionsCount({
            searchString: this.searchKey,
            salary: this.minSalary,
            maxPostedDate: this.maxPostedDate
        })
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
            })
            .catch(error => {
                this.error = error;
                this.totalrecords = undefined;
            });
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
                this.error = undefined;
                this.fireSearchEvent();
                this.currentpage = 1;
            })
            .catch(error => {
                this.error = error;
                this.allPositions = undefined;
            });
    }
    fireSearchEvent() {
        fireEvent(this.pageRef, "search", {
            allPositions: this.allPositions,
            recordsCount: this.totalrecords,
            currentPage: this.currentpage,
            pagesize: this.pagesize
        });
    }


    disconnectedCallback() {
        unregisterAllListeners(this);
    }
}