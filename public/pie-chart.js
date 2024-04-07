function groupExpensesByCategory(expenses) {
  const categoryTotals = {};

  Array.from(expenses).forEach(expense => {
    const { category, amount } = expense;


    if (!categoryTotals[category]) {
      categoryTotals[category] = parseInt(amount);
    } else {
      // If the category already exists, add the current amount to the existing total
      categoryTotals[category] += parseInt(amount);
    }
  });

  return categoryTotals;
}

anychart.onDocumentReady(function () {
  const sanitizedJsonString = chartData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  const expenseData = groupExpensesByCategory(JSON.parse(sanitizedJsonString));

  // Output the result
  //creating data array here
  var data = [];
  //adding objects to data array
  for (const [key, value] of Object.entries(expenseData)) {
    const obj = {
      x: key,
      value: value
    }
    data.push(obj)
  }
  // create the chart
  var chart = anychart.pie();

  // set the chart title
  chart.title("Your Monthly Expenses Chart");

  // add the data
  chart.data(data);
  chart.background().enabled(true).fill("transparent");

  // display the chart in the container
  chart.legend().position("bottom");
  // chart.legend().position("right")
  // set items layout
  chart.legend().itemsLayout("vertical");
  chart.container('container');
  chart.draw();

});
