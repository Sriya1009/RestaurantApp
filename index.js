const debounce = (func, delay) => {
    let debounceTimer;
    return function() {
        const text = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(text, args), delay);
    };
}

const searchMenu = () => {
    const input = document.getElementById('menu-search');
    const filter = input.value.toLowerCase();
    const menuItems = document.getElementsByClassName('menu-item');
    for (let i = 0; i < menuItems.length; i++) {
        const itemName = menuItems[i].getElementsByTagName('p')[0].textContent;
        const itemCourse = menuItems[i].dataset.course;
        if (itemName.toLowerCase().includes(filter) || itemCourse.toLowerCase().includes(filter)) {
            menuItems[i].style.display = '';
        } else {
            menuItems[i].style.display = 'none';
        }
    }
}

const searchTable = () => {
    const input = document.getElementById('table-search');
    const filter = input.value.toLowerCase();
    const tableItems = document.getElementsByClassName('table-item');
    for (let i = 0; i < tableItems.length; i++) {
        const itemName = tableItems[i].getElementsByTagName('p')[0].textContent;
        if (itemName.toLowerCase().includes(filter)) {
            tableItems[i].style.display = '';
        } else {
            tableItems[i].style.display = 'none';
        }
    }
}

const debouncedSearchMenu = debounce(searchMenu, 400);
const debouncedSearchTable = debounce(searchTable, 400);

document.addEventListener('input', () => {
    document.getElementById('menu-search').addEventListener('input', debouncedSearchMenu);
    document.getElementById('table-search').addEventListener('input', debouncedSearchTable);
});

const orders = {
    'Table-1': [],
    'Table-2': [],
    'Table-3': [],
    'Table-4': []
};
let currentTable = '';

const showOrderDetails = (tableName) => {
    const orderData = orders[tableName];

    const modal = document.getElementById('order-modal');
    const modalTableName = document.getElementById('modal-table-name');
    const orderDetails = document.getElementById('order-details');
    const modalDiv = document.getElementById('modal-div');

    // Clear previous order details
    orderDetails.innerHTML = '';

    // Set table name
    modalTableName.textContent = `${tableName} | Order Details`;
    modalDiv.style.border= "1px solid black";
    modalDiv.style.backgroundColor= ' #F0F0F0';
    const row = document.createElement('tr');
    row.innerHTML = `
        <th>S.No</th>
        <th>Item</th>
        <th>Price</th>
        <th>Number of Servings</th>`;
    orderDetails.appendChild(row);

    orderData.forEach((order, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.item}</td>
            <td>${order.price}</td>
            <td><input type="number" value="${order.servings}" min="0" onchange="updateServings('${tableName}', ${index}, this.value)"/></td>
            <td><button onclick="deleteOrder('${tableName}', ${index})">Delete</button></td>
        `;
        orderDetails.appendChild(row);
    });
    currentTable = tableName;
    modal.style.display = 'block';
    document.querySelectorAll('.table-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tableName).classList.add('active');
}

const closeModal = () => {
    const modal = document.getElementById('order-modal');
    const modal2 = document.getElementById('bill-modal');
    modal.style.display = ''
    modal2.style.display = ''
}

const closeBillModal = () => {
    const modal = document.getElementById('bill-modal');
    modal.style.display = ''
}

const updateServings = (tableName, index, newServings) => {
    newServings = parseInt(newServings, 10);
    if (newServings <= 0) {
        orders[tableName].splice(index, 1);
    } else {
        orders[tableName][index].servings = newServings;
    }
    updateTableDisplay(tableName);
    showOrderDetails(tableName);
}

const deleteOrder = (tableName, index) => {
    orders[tableName].splice(index, 1);
    updateTableDisplay(tableName);
    showOrderDetails(tableName);
}

const generateBill = () => {
    const orderData = orders[currentTable];
    if (orderData.length === 0) {
        alert("The table order is empty.");
        return;
    }
    const billModal = document.getElementById('bill-modal');
    const billTableName = document.getElementById('bill-table-name');
    const billDetails = document.getElementById('bill-details');

    // Set table name
    billTableName.textContent = `${currentTable} | Bill`;

    // Clear previous bill details
    billDetails.innerHTML = '';

    // Calculate total price
    let totalPrice = 0;
    orderData.forEach(order => {
        const div = document.createElement('div');
        div.textContent = `${order.item} x ${order.servings} = Rs.${order.price * order.servings}`;
        billDetails.appendChild(div);
        totalPrice += order.price * order.servings;
    });

    // Display total price
    const totalDiv = document.createElement('div');
    const total = document.createElement('p');
    total.textContent = `Total: Rs.${totalPrice}`;
    totalDiv.appendChild(total);
    total.style.fontWeight = 'bold';
    billDetails.appendChild(totalDiv);
    const btn = document.createElement('button');
    btn.textContent = 'close';
    btn.addEventListener('click', reset);
    billDetails.appendChild(btn);

    // Show bill modal
    billModal.style.display = 'block';
}

const reset = () => {
    const orderData = orders[currentTable];

    orderData.forEach(order => {
        order.servings = 0;
    });

    // Reset table display
    updateServings(currentTable, 0, 0);

    // Clear modal input fields
    showOrderDetails(currentTable);

    // Update table display
    updateTableDisplay(currentTable);
    closeModal();
}

const allowDrop = (event) => {
    event.preventDefault();
}

const drag = (event) => {
    event.dataTransfer.setData("text/plain", event.target.dataset.item + "|" + event.target.dataset.price);
}

const drop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    const [item, price] = data.split("|");
    const tableName = event.target.closest('.table-item').id;

    // Add item to table order
    const orderData = orders[tableName];
    const existingOrder = orderData.find(order => order.item === item);

    if (existingOrder) {
        existingOrder.servings++;
    } else {
        orderData.push({ item: item, price: parseFloat(price), servings: 1 });
    }

    updateTableDisplay(tableName);
}

const updateTableDisplay = (tableName) => {
    let totalPrice = 0;
    let totalItems = 0;
    orders[tableName].forEach(order => {
        totalPrice += order.price * order.servings;
        totalItems += order.servings;
    });

    // Update table item display
    const tableItems = document.getElementsByClassName('table-item');
    for (let i = 0; i < tableItems.length; i++) {
        const itemName = tableItems[i].getElementsByTagName('p')[0].textContent;
        if (itemName.toLowerCase() === tableName.toLowerCase()) {
            tableItems[i].getElementsByTagName('span')[0].textContent = `Rs.${totalPrice} | Total items: ${totalItems}`;
            break;
        }
    }
}
