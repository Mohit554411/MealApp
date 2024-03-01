// Fething all nodes from the DOM
const themeChangeCheckBox = document.getElementById('themeChangeCheckBox');
const inputElemnt = document.getElementById('search');
const searchResults = document.getElementById('searchResults');
const detailsSection = document.querySelector('.detailsSection');
const searchPage = document.getElementById('searchPage');
const detailsPage = document.getElementById('detailsPage');
const backToHome = document.getElementById('backToHome');
const favIconBtn = document.querySelector('.favIconBtn');
const favouriteMeals = document.querySelector('.favouriteMeals');
const totalFvtCount = document.getElementById('totalFvtCount');
const firstSection = document.querySelector('.first-section');
const favouriteMealsList = document.getElementById('favouriteMealsList');
//Global variables

let scrollY = 0;
let allFavoriteMeals = [];

// Changing the theme of the website
themeChangeCheckBox.addEventListener('change', () => {
  if (themeChangeCheckBox.checked) {
    document.body.classList.add('dark-theme');
    firstSection.style.backgroundColor = 'black';
  } else {
    document.body.classList.remove('dark-theme');
    firstSection.style.backgroundColor = 'white';
  }
});

// Adding event listener to the input element
inputElemnt.addEventListener('input', debounce(searchMeals, 300));


// Function to search meals
function searchMeals() {
  console.log("searchMeals called" + inputElemnt.value.trim());
  const searchTerm = inputElemnt.value.trim();
  if (searchTerm.length > 0) {
    let meals = getMealsByName(searchTerm);
    meals.then((data) => {
      console.log(data.meals)
      displaySearchResults(data.meals);
    });
  } else {
    clearSearchResults();
  }
}

// Function to debouncing the search
function debounce(func, wait) {
  console.log(" debounce called")
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to fetch meal details from The API
async function getMealsByName(name) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
  const data = await response.json();
  return data;
}

// Function to clear the search results
function clearSearchResults() {
  searchResults.innerHTML = '';
}

// Function to show search meal details
function displaySearchResults(meals) {
  clearSearchResults();
  if (meals === null) {
    searchResults.innerHTML = '<h2>No meals found</h2>';
  } else {
    meals.forEach(meal => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('card');
      resultItem.id = meal.idMeal;
      resultItem.innerHTML = `
                              <div class="card-image">
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" id='${meal.idMeal}'>  
                              </div>
                              <div class="card-deatils">
                                <h3>${meal.strMeal.slice(0, 16)}</h3>
                                <p>${meal.strCategory}</p>
                              </div>
                              <div class="fvt-button-div">
                               <i class="fa-regular fa-star"></i>
                              </div>
                            `;
      searchResults.appendChild(resultItem);
    });
  }
  [...searchResults.children].forEach(meal => {
    allFavoriteMeals.forEach(fvtMeal => {
      if (meal.id === fvtMeal.id) {
        meal.children[2].children[0].classList.remove('fa-regular');
        meal.children[2].children[0].classList.add('fa-solid');
      }
    });
  });
}



searchResults.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    searchPage.style.display = 'none';
    detailsPage.style.display = 'flex';
    backToHome.style.display = 'block';
    scrollY = window.scrollY;
    window.scrollTo(0, 0);
    showMealDetail(e.target.id);
  }

  if (e.target.tagName === 'I') {
    e.target.classList.toggle('fa-regular');
    e.target.classList.toggle('fa-solid');
    if (e.target.classList.contains('fa-solid')) {
      if (!allFavoriteMeals.some(fvtMeal => fvtMeal.id === e.target.parentElement.parentElement.id)) {
        allFavoriteMeals.push(
          {
            id: e.target.parentElement.parentElement.id,
            imageUrl: e.target.parentElement.parentElement.children[0].children[0].src,
            mealName: e.target.parentElement.parentElement.children[1].children[0].textContent,
            category: e.target.parentElement.parentElement.children[1].children[1].textContent
          }
        );
      }
    }
    else {
      allFavoriteMeals = allFavoriteMeals.filter(fvtMeal => fvtMeal.id !== e.target.parentElement.parentElement.id);
    }
    console.log(allFavoriteMeals);
    addRemoveFavouriteMeals();
    totalFvtCount.textContent = allFavoriteMeals.length;
    console.log(allFavoriteMeals);
  }

});

// Function to show meal details
function showMealDetail(id) {
  const meal = getMealDetails(id);
  meal.then((data) => {
    displayMealDetails(data.meals[0]);
  });
}

// Function to fetch meal details from The API
function getMealDetails(id) {
  return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(response => response.json())
    .catch(error => console.error('Error fetching meal details:', error));
}

// Function to display meal details
function displayMealDetails(meal) {
  console.log(meal);
  const mealDetail = document.createElement('div');
  mealDetail.classList.add('meal-detail');
  mealDetail.innerHTML = `
                          <div class="meal-detail-image">
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                          </div>
                          <div class="meal-detail-content">
                            <h2>Meal Name : ${meal.strMeal}</h2>
                            <p>Category : ${meal.strCategory}</p>
                            <p>Area : ${meal.strArea}</p>
                            <h3>Ingredients</h3>
                            <pre>${getIngredients(meal)}</pre>
                          </div>
                          <div class="meal-instruction">
                            <h3>Instructions</h3>
                            <p>${meal.strInstructions}</p>
                          </div>
                          
                          <i class="fa-regular fa-star fvt-button"></i>
                        `;
  detailsSection.innerHTML = '';
  detailsSection.appendChild(mealDetail);
}

function getIngredients(meal) {
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}\n`;
    }
  }
  return ingredients;
}

backToHome.addEventListener('click', () => {
  window.scrollTo(0, scrollY);
  scrollY = 0;
  searchPage.style.display = 'flex';
  detailsPage.style.display = 'none';
  backToHome.style.display = 'none';
});


favIconBtn.addEventListener('click', () => {
  favouriteMeals.style.display = 'flex';
});


favouriteMeals.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    searchPage.style.display = 'none';
    detailsPage.style.display = 'flex';
    backToHome.style.display = 'block';
    favouriteMeals.style.display = 'none';
    showMealDetail(e.target.id);

  }
  else if (e.target.id === 'closeBtn') {
    favouriteMeals.style.display = 'none';
  }
  else if (e.target.id === 'clearAllFvt') {
    favouriteMealsList.innerHTML = '';
    allFavoriteMeals=[];
    totalFvtCount.textContent = allFavoriteMeals.length;
    [...searchResults.children].forEach(meal => {
      meal.children[2].children[0].classList.remove('fa-solid');
      meal.children[2].children[0].classList.add('fa-regular');
    });
  }
  else if (e.target.id === 'removeFvt') {
    const meal = e.target.parentElement.children[0];
    console.log(meal);
    e.target.parentElement.remove();

    [...searchResults.children].forEach(meals => {
      if (meals.id === meal.id) {
        meals.children[2].children[0].classList.remove('fa-solid');
        meals.children[2].children[0].classList.add('fa-regular');
      }
    });
    allFavoriteMeals.forEach(fvtMeal => {
      if (fvtMeal.id === meal.id) {
        allFavoriteMeals.pop(fvtMeal);
      }
    });
    totalFvtCount.textContent = allFavoriteMeals.length;
  }
});


function addRemoveFavouriteMeals() {
  favouriteMealsList.innerHTML = '';
  allFavoriteMeals.forEach(value => {
    const mealItem = document.createElement('div');
    mealItem.innerHTML = `
                              <img src="${value.imageUrl}" alt="${value.mealName}" id="${value.id}" 
                               style="width:80%;height:300px;object-fit:cover;display:block;border-radius:5px;margin: 0 auto">
                              <h3 style="margin: 5px 0">${value.mealName}</h3>
                              <b>${value.category}</b><br>
                              <i style="margin: 10px 0;cursor:pointer" class="fa-solid fa-star" id="removeFvt"></i>    
                           `;
    favouriteMealsList.appendChild(mealItem);
  });

}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('allFavoriteMeals')) {
    allFavoriteMeals = JSON.parse(localStorage.getItem('allFavoriteMeals'));
    allFavoriteMeals = allFavoriteMeals.filter(fvtMeal =>  fvtMeal !== null && fvtMeal !== '' && fvtMeal !== undefined);
    addRemoveFavouriteMeals();
    totalFvtCount.textContent = allFavoriteMeals.length;
  }
});

window.addEventListener('beforeunload', function (event) {
  // Save your data to local storage here
  localStorage.setItem('allFavoriteMeals', allFavoriteMeals.length ? JSON.stringify([...allFavoriteMeals]) : '');
  // The following line is optional and will display a confirmation dialog
  // It's mainly useful to inform the user if they have unsaved changes
  var confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
  (event || window.event).returnValue = confirmationMessage;
  return confirmationMessage;
});