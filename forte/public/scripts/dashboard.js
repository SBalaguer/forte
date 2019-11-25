console.log("loaded")
const allTabs = document.getElementById("tab-container").getElementsByTagName("li");
console.log(allTabs);
let activeTab = document.getElementsByClassName("selected");
console.log(activeTab);

let mockData = [
{contractor:"joe",amount:"50",status:"approved"},
{contractor:"ruth",amount:"30",status:"paid"},
{contractor:"jane",amount:"100",status:"rejected"},
{contractor:"donny",amount:"10",status:"unaproved"},
]
