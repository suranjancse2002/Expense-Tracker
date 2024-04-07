// console.log("Hello")
const tags = document.querySelector("#inputFormTags");

var cntClick = 0;
let expenseData;
var expenDataLength = 0;
let constCount;

tags.addEventListener('change', function () {
    // Get the selected value
    const selectedValue = tags.value;

    // Make an API request using Fetch
    // http://localhost:5500/8/filter?type=Family
    //Id should be here
    let apiurl;
    if (selectedValue == "All") {
        apiurl = `http://localhost:5500/${userId}`;
    }
    else {
        apiurl = `http://localhost:5500/${userId}/filter?type=${selectedValue}`;
    }

    async function fdata() {
        const data = await fetch(apiurl);
        const res = await data.json();
        const len = res.length;
        expenseData = res;
        // console.log(res)
        // console.log(userId)
    }

    async function createDiv() {
        await fdata();
        var parentDiv = document.querySelector('.item-container');
        // parentDiv.innerHTML = '';
        document.querySelector('.item-container').innerHTML = expenseData.map(expense =>
            `
                <div class="item-box">
                            <div class="first-section">
                                <div class="category" id="category">
                                    ${expense.category}
                                </div>
                                <div class="first-section-inner">
                                    <div class="payment" id="payment">
                                        ${expense.payment_method}
                                    </div>
                                    <div class="tag" id="tag">
                                        ${expense.tag}
                                    </div>
                                </div>
                            </div>
                            <div class="amount" id="amount">
                                ${expense.amount}
                            </div>
                            <div class="description" id="description">
                                ${expense.description}
                            </div>
                                <div class="date" id="date">
                                    ${new Date(expense.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short', year: 'numeric'
            })}
                                </div>
                                <div class="last-section">
                                    <a href="/update/${expense.id}" class="btn"><i class="fa-solid fa-pen"></i>&nbsp
                                        Edit</a>
                                    <a href="/image/${expense.id}" class="btn"><i
                                            class="fa-solid fa-image"></i>&nbsp Receipt</a>
                                </div>
                        </div>
                `
        ).join("")
        expenseData.forEach(element => {
            console.log(element);
        });
    }


    async function setData() {
        await createDiv();
        var expenses = document.querySelectorAll(".item-box")
        for (var i = 0; i < expenseData.length; i++) {
            if (i < 4) {
                // console.log(expenses[i]);
                expenses[i].style.display = 'block'
            }
            else {
                expenses[i].style.display = 'none'
            }
            // console.log(expenseData[4 * cntClick + i])
        }
        if (expenseData.length > 4) {
            document.querySelector(".fa-arrow-right").style.display = "block"
        }
        else {
            document.querySelector(".fa-arrow-right").style.display = "none"
        }
        document.querySelector(".fa-arrow-left").style.display = "none"
    }
    setData();


});
// document.onload()
document.addEventListener('DOMContentLoaded', function () {
    const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    expenseData = JSON.parse(sanitizedJsonString);
    var expenses = document.querySelectorAll(".item-box")
    expenDataLength = expenses.length;
    constCount = expenses.length
    if (expenseData.length > 4) {
        document.querySelector(".fa-arrow-right").style.display = "block"
    }
    else {
        document.querySelector(".fa-arrow-right").style.display = "none"
    }
    for (var i = 0; i < expenseData.length; i++) {
        if (i < 4) {
            // console.log(expenses[i]);
            expenses[i].style.display = 'block'
        }
        else {
            expenses[i].style.display = 'none'
        }
        // console.log(expenseData[4 * cntClick + i])
    }
});


if (cntClick == 0) {
    document.querySelector(".fa-arrow-left").style.display = "none"
}
document.querySelector('.fa-arrow-right').addEventListener('click', () => {
    if (expenseData.length > ((cntClick + 1) * 4)) {
        cntClick++;
        document.querySelector(".fa-arrow-left").style.display = "block"
        // console.log(cntClick)

        // console.log(expenseData.length)
        if (expenseData.length < (cntClick + 1) * 4) {
            document.querySelector(".fa-arrow-right").style.display = "none"
        }
        if (expenseData.length >= 4 * cntClick) {
            const start = 4 * cntClick;
            const end = 4 * cntClick + 4;
            var expenses = document.querySelectorAll(".item-box")
            for (var i = 0; i < expenseData.length; i++) {
                if (i >= start && i < end) {
                    // console.log(expenses[i]);
                    expenses[i].style.display = 'block'
                }
                else {
                    expenses[i].style.display = 'none'
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
    if (cntClick > 0) {
        cntClick--;
        if (cntClick == 0) {
            document.querySelector(".fa-arrow-left").style.display = "none"
        }
        document.querySelector(".fa-arrow-right").style.display = "block"
        // console.log(cntClick)
        // const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        // const expenseData = JSON.parse(sanitizedJsonString);
        if (expenseData.length >= 4 * cntClick) {
            const start = 4 * cntClick;
            const end = 4 * cntClick + 4;
            var expenses = document.querySelectorAll(".item-box")
            for (var i = 0; i < expenseData.length; i++) {
                if (i >= start && i < end) {
                    // console.log(expenses[i]);
                    expenses[i].style.display = 'block'
                }
                else {
                    expenses[i].style.display = 'none'
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