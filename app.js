// -------------------------------------------- Example for modules
/*
var budgetController = (function() { // це і є модуль

    var x = 23; // приватна змінна

    var add = function(a) { // also private function
        return x + a;
    }

    return {
        publicTest: function(b) {
            return add(b);
        }
    }

})();
// якщо в консолі набрати budgetController.x // undefined
// budgetController.add() // undefined
// бо це все приватні дані
// а якщо  budgetController.publicTest(5) // 28
// бо метод publicTest є публічним і завжди буде мати доступ до змінної х і функ add ( завдяки замиканню)


var UIController = (function () {

    // some code

})();


var controller = (function(budgetCtrl, UICtrl) { // Модуль контролю, який звязує модулі між собою

    var z = budgetCtrl.publicTest(6); // доступаємся до модуля budgetController

    return {
        anotherPublic: function() {
            console.log(z); // 29
        } // тільки так ми можемо доступитися ззовні до змінної z
    }

})(budgetController, UIController); // приймає в якості аргументів 2 інші модулі і може доступитися до них!
*/

// --------------------------------------------------------- ProJECT

// Budget CONTROLLER
var budgetController = (function() { // це і є модуль

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this. value = value;
        this.percentages = -1;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this. value = value;
    }

    Expense.prototype.calcPercentages = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentages = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentages = -1;
        }
    }; // обчислює відсотки для витрат

    Expense.prototype.getPercentage = function () { // повертає вище обчислені відсотки
        return this.percentages;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // створення айдішки для кожного нового елемента
            } else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push new items in our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            /*
            id = 6
            data.allItems[type][id];
            ids = [1,2,4,6,8] // нібито це айдішки наших елементів у масиві
            index = 3
            */
            ids = data.allItems[type].map(function(current) {
                    // console.log(current.id);
                    return current.id;
                    // current = [1, 2, 4, 6, 8]
            });
        
            index = ids.indexOf(id);// знаходимо індекс кожного з елементів (масив індексів)
            // current = [1, 2, 4, 6, 8]
            // index = [0, 1, 2, 3, 4], тому якщо index = 3, id = 6

            // видалення елемента
            if (index !== -1) { // -1, бо indexOf повертає -1, якщо не знайдено елемент в масиві
                data.allItems[type].splice(index, 1); //видаляємо з позиції index 1 елемент
            }
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate total budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            // MAYBE WRONG
            if (data.totals.inc !== 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = '---';
            }
        },

        calculatePercentages: function() {
            /*
            a=10;
            b=20;
            c=40;
            tot income = 100
            a=20/100=10%
            b=20%
            c=40%
            */
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            }); // для кожного елемента массиву витрат вираховуємо відсотки
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage(); // кожен ретурн для кожного елемента буде записуватись в змінну allPers
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() { // завдяки цьому - тестуємо в консольці дата структуру (без попереднього показу на інтерфейс)
            console.log(data);
        }

    }

})();


// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = { 
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    }; // створення дата структури, щоб потім не міняти класи у всіх місцях, а тільки тут. (полегшення життя)

    var formatNumber = function(num, type) {
        var numSplit, int, dec, sign;

        /*
        + or - before number (type)
        exactly two decimals points
        comma separeting the thousand

        2345.6789 --> + 2,345.68
        */

        num = Math.abs(num); // обрізає знак
        num = num.toFixed(2); // обрізає, або додає 2 знаки після коми і перетворює число в строку

        // оскільки це тепер строка, використ метод split, щоб розбити на частини: до крапки і після
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) { // ставимо кому на тисячні
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
            // input = 1234 --> 1,234; 12345 --> 12,345
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';
        return sign + ' ' + int + '.' + dec; 

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i); // callback функ, значення якої підставлються нижче як аргументи
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat - перетворення стрічки в число
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer; // '.income__list'

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer; // '.expenses__list'

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id); // заміняємо кусок коду з хтил змінної
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert HTML inti the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            // вибираємо куди саме і вставляємо кусок хтмл в хтмл документ
        },

        deleteListItem: function(selectorID) {
            /*
            в JS ми не можемо видалити зразу ж вибраний елемент
            ми можемо видалити батьківський елемент
            тому йдемо на один рівен вище по DOM - parentNode і видаляємо дочірній елемент
            */
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // коли ми вибираємо якісь селектори, в дужках прописуємо як у синтаксисі css, тому додаєму кому як стрінгу

            // але в змінну fields буде записаний не массив, а list

            // щоб переробити ліст в масив:
            fieldsArray = Array. prototype.slice.call(fields);
            // Доступаємся до пропотипної властивості slice глобального об'єкта Array і викликаємо call для нашої змінної.
            // В результаті з list отримаємо масив. Записуємо його в змінну fieldsArray

            fieldsArray.forEach(function(current, index, array) { // перебір масиву
                current.value = "";
                // знаходить в циклі fieldsArray його методи inputDescription і inputValue
                // підставляє їх в current і по черзі проходиться по них
            });

            // Фокусуємся саме на цьому інпуті, щоб він був активним першочергово
            fieldsArray[0].focus();
        },

        displayBudget : function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
         
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPersentages: function(percentage) {

            // записуємо в змінну всі класи відсотків з хтмл
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // returns node list (список вузлів)

            // метод forEach працює тільки з массивами, а в нас є list
            // тому ми пишемо власну функцію nodeListForEach, яка буде працювати з лістами
            
            // звідси вирізали функ nodeListForEach, щоб вона була доступною в інших місцях

            nodeListForEach(fields, function(current, index) {
                // викликаємо функцію nodeListForEach, яка в якості параметрів приймає список вузлів fields і callback функцію
                // callback функція з тим кодом, що тут всереднині неї передається як аргумент

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMounth: function () {
            var now, year, mounth, mounths;

            now = new Date(); // використовуємо загальний конструктор Date
            // var chtristmas = new Date(2019, 03, 25) // так також можна
            mounths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Nowember', 'December'];

            mounth = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = mounths[mounth] + ' ' + year;
        },

        changedType: function() {

            // записуємо в змінну список трьох селекторів
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' +DOMstrings.inputValue);

            // викликаємо функцію nodeListForEach для цього списку і кожному додаємо перемикач
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus'); // якщо немає такого класу - він додається, і навпаки
            });

            var button = document.querySelector(DOMstrings.inputBtn);
            button.classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
    
    // this code here will execute immediately
    // and then the object that we return will be assigned
    // to this UIController
})();


// GLOBAL APP  CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var setupEventListener = function() {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) { // which - for old browsers
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // Event Delegation

        // DOM.inputType - це наш клас селекту вибору + чи - з хтил
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPersentages(percentages);
    };

    var ctrlAddItem = function() { // коли хтось нажме ентер, або клікне по кнопці
        var input, newItem;

        // 1. Get the filed input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clean fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // в такий спосіб ми доступаємся в ДОМ дереві до батьківських елементів на 4 вузли
        // target - ссилка, на якій буде ініціалізована подія.. там де нажмем, цей вузол з DOMу нам і покаже
        // parentNode - метод, завдяки якому ми посуваємся на 1 вузол догори по DOMу
        // id - через цю пропертю доступаємся до айдішки вибраново вузла DOMу

        splitID = itemID.split('-'); // поділ строки з айдішкою на дві частини через '-' знак
        // splitID = ['inc', '0']
        type = splitID[0];
        ID = +splitID[1];// але ми не можемо передати ID, бо це строка (перетворюємо в число)

        // 1. Delete the item from the Data structure
        budgetController.deleteItem(type, ID);

        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Calculate and update percentages
        updatePercentages();
    }

    return {
        init: function() { // функція ініціалізації (з її допомогою тут будемо викликати інші функції)
            console.log('app has started');
            UICtrl.displayMounth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init(); // без цієї стрічки нічого не відбудеться, бо ця функ визиває наші івентЛістенери









































