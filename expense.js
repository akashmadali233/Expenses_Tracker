
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
    if (!token && !window.location.href.includes('signIn.html')) {
        window.location.href = 'signIn.html'; 
    }
});

function addNewExpense(event){
    event.preventDefault();
    const expenseDetails = {
        amount : event.target.amount.value,
        description : event.target.description.value,
        category : event.target.category.value
    }
    console.log(expenseDetails);
    fetch('http://localhost:8080/api/expense/addexpense',{
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify(expenseDetails)
    })
    .then((response) => {
        if(response.status === 201){
            window.location.reload();
        }else{
            throw new console.log("Failed to create new expense");
        }
    })
    .catch((error) => {
        console.log(error);
    })
}


window.addEventListener('DOMContentLoaded', ()=> {
    fetch('http://localhost:8080/api/expense/getexpense',{
        method : 'GET',
        headers : {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        }
    })
    .then(response => response.json())
    .then(data => {
        addNewExpenseToUI(data.expenses);
    })
    .catch((error) => {
        console.log(error);
    })
})          


window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/api/getalls3buckets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        }
    })
    .then(response => response.json())
    .then(data => {
        addingNewLinksToUI(data.success.links);
    })
    .catch((error) => {
        console.log(error);
    });
});

function addingNewLinksToUI(links) {
    const s3bucketlink = document.getElementById("s3buckets-link");
    s3bucketlink.innerHTML = "";
    s3bucketlink.innerHTML = `
        <h2>User Total Expenses</h2>
        <table>
            <thead> 
                <tr> 
                    <th>File URL</th> 
                    <th>Created At</th> 
                </tr> 
            </thead> 
            <tbody>
                ${links.map(link => `
                    <tr>
                        <td><a href="${link.fileURL}">${'DownloadFile'}</a></td>
                        <td>${new Date(link.createdAt).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

            
function addNewExpenseToUI(expenses){
    const expenseList = document.getElementById("expense-list");
    const totalAmountElement = document.getElementById("total-amount");

    expenseList.innerHTML = "";
    let totalAmount = 0; 
    for (let i = 0; i < expenses.length; i++) { 
        const expense = expenses[i]; 
        const expenseRow = document.createElement("tr")
        expenseRow.innerHTML = `
        <td>${expense.amount}</td>
        <td>${expense.description}</td> 
        <td>${expense.category}</td> 
        <td class="delete-btn" data-id="${expense.id}" onclick="deleteExpensedetails(this)">Delete</td>  `;

        expenseList.appendChild(expenseRow); 
        totalAmount += JSON.parse(expense.amount); 
    }
    totalAmountElement.textContent = totalAmount.toFixed(2); 
}
   


function deleteExpensedetails(element){
    let id = element.getAttribute('data-id');

    fetch('http://localhost:8080/api/expense/deleteexpense',{
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ id: id }) 
    })
    .then((response) => {
        if(response.status === 200){4
            window.location.reload();
        }else{
            console.log("Failed to create new expense");
        }
    })
    .catch((error) => {
        console.log(error);
    })
}


document.getElementById('rzp1-button').onclick = async function(e) {
    e.preventDefault(); 
    try {
        const response = await fetch('http://localhost:8080/api/purchase/premiummembership', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const responseData = await response.json();
        const options = {
            "key": responseData.key_id,
            "order_id": responseData.order.id,

            "handler": async function(response) {
                try {
                    const updateResponse = await fetch('http://localhost:8080/api/purchase/updatetransactionsstatus', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id
                        })
                    });

                    const updateData = await updateResponse.json();

                    if (updateResponse.ok) {
                        window.location.reload();
                    } else {
                        
                        alert("Payment failed: " + updateData.error);
                    }
                } catch (error) {
                    console.error('Error updating transaction status:', error);
                    alert("Error updating transaction status: " + error.message);
                }
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (error) {
        console.error('Error:', error);
        alert("Error: " + error.message);
    }
};


window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/api/purchase/userpremiumornot', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    })
    .then(response => response.json())
    .then((data) => {
        const premiumContainer = document.getElementById('premium-container');
        const rzp1Button = document.getElementById('rzp1-button');
        if (data.status == true) {
            premiumContainer.style.display = "block"; 
            rzp1Button.style.display = "none"; 
        } else {
            premiumContainer.style.display = "none"; 
            rzp1Button.style.display = "block";
        }
    })
    .catch((error) => {
        console.log(error);
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const showDetailsBtn = document.getElementById("show-details-btn");
    const userDetails = document.getElementById("user-details");

    showDetailsBtn.addEventListener("click", function() {
        fetchUserDetails();
    });

    function fetchUserDetails() {
        fetch('http://localhost:8080/api/getalluserexpenses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            return response.json();
        })
        .then(data => {
            showUserDetails(data.expenses);
        })
        .catch(error => {
            console.log('Error fetching user details:', error);
        });
    }

    function showUserDetails(userDetailsData) {
        userDetails.innerHTML = "";
        userDetails.innerHTML = `
            <h2>User Total Expenses</h2>
            <table>
            <thead> 
                    <tr> 
                        <th>Name</th> 
                        <th>Total Expense</th> 
                    </tr> 
                </thead> 
                <tbody>
                    ${userDetailsData.map(userDetail => `
                        <tr>
                            <td>${userDetail.name}</td>
                            <td>${userDetail.total_expense_amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        // Show the user details section
        userDetails.style.display = "block";
    }
});


async function download(event) {
    event.preventDefault();
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.disabled = true;
    try {
        const response = await fetch('http://localhost:8080/api/download', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            const a = document.createElement('a');
            a.href = data.success.url; 
            a.download = 'myExpense.xlsx';
            a.click();
            alert('File downloaded successfully!');
        } else {
            console.log('Error:', data.error.message);
        }
    } catch (error) {
        console.log('Error:', error);
    }finally{
        downloadButton.disabled = false; 
    }
}
