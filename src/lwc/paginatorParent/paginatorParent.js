/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {api, LightningElement, track} from 'lwc';
import getPositionsList from '@salesforce/apex/RecruitmentIntegration.getPositionsList';
import getPositionsCount from '@salesforce/apex/RecruitmentIntegration.getPositionsCount';

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
    @track showDetails = false;
    @track detailIsExpanded;
    selectedPosition;

    handleSearchChange(event) {
        if (this.searchKey !== event.target.value) {
            this.isSearchChangeExecuted = false;
            this.searchKey = event.target.value;
            this.currentpage = 1;
            console.log("Current searchWord ", this.searchKey);

        }
    }
    renderedCallback() {
        console.log("searchKey in paginatorParent", this.searchKey);
        // let rightNow = new Date();
        // rightNow.setMinutes(
        //     new Date().getMinutes() - new Date().getTimezoneOffset()
        // );
        // this.today = rightNow.toISOString().slice(0, 10);
        // this.maxPostedDate = new Date("2000-01-01");

        if (this.isSearchChangeExecuted && (this.localCurrentPage === this.currentpage)) {
            console.log("currentpage", this.currentpage);
            console.log("localcurrentpage", this.localCurrentPage);
            console.log("isSearchChangeExecuted", this.isSearchChangeExecuted);
            return;
        }
        this.isSearchChangeExecuted = true;
        this.localCurrentPage = this.currentpage;
        console.log("executing apex methods");
        getPositionsCount({searchString: this.searchKey})
            .then(recordsCount => {
                this.totalrecords = recordsCount;
                console.log("recordsCount", recordsCount);
                if (recordsCount !== 0 && !isNaN(recordsCount)) {
                    this.totalpages = Math.ceil(recordsCount / this.pagesize);
                    getPositionsList({
                        pagenumber: this.currentpage,
                        numberOfRecords: recordsCount,
                        pageSize: this.pagesize,
                        searchString: this.searchKey
                    })
                        .then(positionList => {
                            console.log("getPositionList successfullt");
                            this.allPositions = positionList;
                            this.error = undefined;
                        })
                        .catch(error => {
                            this.error = error;
                            this.allPositions = undefined;
                        });
                } else {
                    this.allPositions = [];
                    this.totalpages = 1;
                    this.totalrecords = 0;
                }
                const event = new CustomEvent('recordsload', {
                    detail: recordsCount
                });
                this.dispatchEvent(event);
            })
            .catch(error => {
                this.error = error;
                this.totalrecords = undefined;
            })
    }

    handleSelectedPosition(event) {
        this.showDetails === true ? this.showDetails = false : this.showDetails = true;
        console.log("showDetails in parent ", this.showDetails);
        this.detailIsExpanded = true;

        // console.log("position selected");
        // this.selectedPositionList = [];
        // const selectedPositionId = event.detail.Id;
        // this.selectedPosition = this.allPositions.find(position => position.Id === selectedPositionId);
        // console.log(this.selectedPosition);
        // console.log(Object.keys(this.selectedPosition));
        // Object.keys(this.selectedPosition).forEach(positionKey => {
        //     console.log("inside forEach", positionKey);
        //     // if (!this.utilityRecordFields.includes(positionKey)) {
        //         const cleanKey = positionKey.replace(/(__c|_)/g, " ");
        //         const newObj = {
        //             "key": cleanKey,
        //             "value": this.selectedPosition[positionKey]
        //         }
        //         this.selectedPositionList.push(newObj);
        //     // }
        //
        // });
    }
    handleApply(event) {
        const position = event.detail;
        this.dispatchEvent(new CustomEvent("apply", {
            detail: position
        }));
    }
}