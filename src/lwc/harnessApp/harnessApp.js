/**
 * Created by yurii.bubis on 10/27/2022.
 */
/**
 * Треба перемістити апекс методи з paginatorParent сюди і виконувати пошук тут.
 * Можуть виникати проблеми з паджинацією, можливо вся ця затія не вартує того і
 * ми просто строку пошуку залишимо в елементі paginatorParent і вона буде на пів екрану.
 */
import {LightningElement, api, track} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";

const PAGE_SIZE = 5;
export default class HarnessApp extends LightningElement {
    @api page = 1
    totalrecords;
    @api _pagesize = PAGE_SIZE;
    @track selectedPositions = [];
    @track selectedPositionsIds = [];
    showModal;
    searchExecuted;
    // searchKey;
    // minSalary;
    // maxPostedDate;
    // @track allPositions = [];


    renderedCallback() {
        // console.log("Selected Position Ids in HarnessApp", JSON.stringify(this.selectedPositionsIds));
    }

    get pagesize() {
        return this._pagesize;
    }
    set pagesize(value) {
        this._pagesize = value;
    }
    get showSubmitButton() {
        return this.selectedPositions.length > 0;
    }
    handlePrevious() {
        if (this.page > 1) {
            this.page = this.page - 1;
        }
    }
    handleNext() {
        if (this.page < this.totalPages) {
            this.page = this.page + 1;
        }
    }
    handleFirst() {
        this.page = 1;
    }
    handleLast() {
        this.page = this.totalPages;
    }
    handleRecordsLoad(event) {
        this.totalrecords = event.detail.totalrecords;
        this.totalPages = Math.ceil(this.totalrecords / this.pagesize);
        this.searchExecuted = false;
    }
    handlePageChange(event) {
        this.page = event.detail;
    }
    handleApply(event) {
        const position = event.detail;
        // console.log("position that comes from selectedPosition" , position);

        if (!this.selectedPositionsIds.includes(position.Id)) {
            console.log(`List ${this.selectedPositionsIds} NOT includes this position ${position.Id}`);
            this.selectedPositions = [...this.selectedPositions, position];
            this.selectedPositionsIds = [...this.selectedPositionsIds, position.Id];
        } else {
            console.log(`List ${this.selectedPositionsIds} includes this position ${position.Id}`);
            this.selectedPositions = this.selectedPositions.filter(item => item !== position);
            this.selectedPositionsIds = this.selectedPositionsIds.filter(item => item !== position.Id);

            // this.dispatchEvent( new ShowToastEvent({
            //     title: "Error",
            //     message: "This position already in the list!",
            //     variant: "warning"
            // }));
        }
    }
    handleSearchChange(event) {
        this.searchKey = event.detail.searchKey;
        this.minSalary = event.detail.minSalary;
        this.maxPostedDate = event.detail.maxPostedDate;
    }
    removeSelectedPosition(event) {
        const positionId = event.detail;
        this.selectedPositions = this.selectedPositions.filter(position => position.Id !== positionId);
        this.selectedPositionsIds = this.selectedPositionsIds.filter(position => position !== positionId);
        console.log(`List ${this.selectedPositionsIds} includes this position ${positionId}`);
        console.log("selectedPositions", this.selectedPositions);


    }


}