// console.log(document.getElementById('inputFormCategory').innerHTML)
const category = document.querySelector('#inputFormCategory');
const tags = document.querySelector("#inputFormTags");
let isFiltering = false; 


category.addEventListener('change', filterByCategory)
tags.addEventListener('change', filterByCategory)


function filterByCategory() {
    if (isFiltering) {
        return; // If already filtering, return early
    }

    isFiltering = true;


    const selectedcategory = category.value
    const selectedtag = tags.value
    const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    const expenseData = JSON.parse(sanitizedJsonString);
    // var expenses = document.getElementsByClassName('item-container');
    // console.log(selectedcategory, selectedtag)
    var expenses = document.querySelectorAll(".item-box")

    let matched = 0;
    let matchedArray = [];
    for (var i = 0; i < expenseData.length; i++) {
        const categoryMatch = selectedcategory === 'All' || expenseData[i].category === selectedcategory;
        const tagMatch = selectedtag === 'All' || expenseData[i].tag === selectedtag;

        if(categoryMatch && tagMatch){
            matched++;
            matchedArray.push(i);
        }
        expenses[i].style.display = categoryMatch && tagMatch ? 'block' : 'none';
    }
    console.log(matched)
    console.log(matchedArray)
    var cntClick = 0;
    var expenDataLength = 0;

    if (matched > 4) {
        document.querySelector(".fa-arrow-right").style.display = "block"
        for(var i=0; i<matched; i++){
            if(i < 4){
                expenses[matchedArray[i]].style.display = "block"
            }
            else{
                expenses[matchedArray[i]].style.display = "none"
            }
        }
    }
    else {
        document.querySelector(".fa-arrow-right").style.display = "none"
    }

    if (cntClick == 0) {
        document.querySelector(".fa-arrow-left").style.display = "none"
    }
    document.querySelector('.fa-arrow-right').addEventListener('click', () => {
        if (matched > ((cntClick + 1) * 4)) {
            cntClick++;
            document.querySelector(".fa-arrow-left").style.display = "block"
            // console.log(cntClick)
            const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            const expenseData = JSON.parse(sanitizedJsonString);
            // console.log(matched)
            if(matched < (cntClick + 1) * 4){
                document.querySelector(".fa-arrow-right").style.display = "none"
            }
            if (matched > 4 * cntClick) {
                const start = 4 * cntClick;
                const end = 4 * cntClick + 4;
                console.log("Matched : ", matched)
                var expenses = document.querySelectorAll(".item-box")
                for(var i=0; i<expenseData.length; i++){
                    expenses[i].style.display = 'none'
                }
                for (var i = start; i < end; i++) {
                    if (i < matched) {
                        console.log([matchedArray[i]]);
                        expenses[matchedArray[i]].style.display = 'block'
                    }
                    else {
                        // console.log(matchedArray[i])
                        // expenses[matchedArray[i]].style.display = 'none'
                    }
                    // console.log(expenseData[4 * cntClick + i])
                }
            }
            else {
                // console.log("Less items in expense tracker")
            }
        }
    })

    document.querySelector('.fa-arrow-left').addEventListener('click', () => {
        // if (cntClick == 0) {
        //     document.querySelector(".fa-arrow-left").style.display = "none"
        //     const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        //     const expenseData = JSON.parse(sanitizedJsonString);
        //     var expenses = document.querySelectorAll(".item-box")
        //     for(var i=0; i<expenseData.length; i++){
        //         expenses[i].style.display = 'none'
        //     }
        //     for(var i=0; i<matched; i++){
        //         if(i < 4){
        //             console.log(matchedArray[i])
        //             expenses[matchedArray[i]].style.display = "block"
        //         }
        //         else{
        //             expenses[matchedArray[i]].style.display = "none"
        //         }
        //     }
        // }
        if (cntClick >= 0) {
            cntClick--;
            if (cntClick == 0) {
                document.querySelector(".fa-arrow-left").style.display = "none"
            }
            document.querySelector(".fa-arrow-right").style.display = "block"
            // console.log(cntClick)
            const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            const expenseData = JSON.parse(sanitizedJsonString);
            if (matched >= 4 * cntClick) {
                const start = 4 * cntClick;
                const end = 4 * cntClick + 4;
                var expenses = document.querySelectorAll(".item-box")
                console.log("Matched : ", matched)
                for(var i=0; i<expenseData.length; i++){
                    expenses[i].style.display = 'none'
                }
                for (var i = start; i < matched; i++) {
                    if (i < end) {
                        // console.log(expenses[i]);
                        console.log([matchedArray[i]]);
                        expenses[matchedArray[i]].style.display = 'block'
                    }
                    else {
                        expenses[matchedArray[i]].style.display = 'none'
                    }
                    // console.log(expenseData[4 * cntClick + i])
                }
            }
            else {
                // console.log("Less items in expense tracker")
            }
        }
        else {
            // console.log("can not click")
        }
    })
    // expenseData.forEach((expense) => {


    //     // Set display based on filter matches
    //     console.log(expense.querySelector('#tag').innerText.trim())
    //     console.log(categoryMatch && tagMatch)

    // })
    isFiltering = false; // Reset the flag

}
