var searchButton = document.getElementById("searchButton");
var apiKey = "85857c701d7ce923224dc913bce8a931";
var forecastApiKey = "6bcf593542f7a47e3d0270622beebb8d";
var inputCity = document.getElementById("inputCity");
var cityName = document.getElementById("cityName");
var currentTemp = document.getElementById("currentTemp");
var currentWind = document.getElementById("currentWind");
var currentHumid = document.getElementById("currentHumid");
var currentUV = document.getElementById("currentUV");
const dt = new Date();

var currentDate = dt.toLocaleDateString();
let savedCities = JSON.parse(localStorage.getItem("cities")) || [];

// Show previously searched cities from local storage on load of the page
window.addEventListener("load",function(event){
    document.getElementById("weatherCls").classList.add("d-none");

    savedCitiesJson = JSON.parse(localStorage.getItem("cities"));
    console.log("savedCitiesJson"+savedCitiesJson);

    if(savedCitiesJson != null && savedCitiesJson.length > 0) {
        for(i=0;i<savedCitiesJson.length;i++) {
            divVar = document.createElement("div");
            divVar.style = "margin-bottom:5px";
            btnVar = document.createElement("button");
            btnVar.style.width = "100%";
            btnVar.className = savedCitiesJson[i];
            btnVar.textContent = savedCitiesJson[i];
            btnVar.addEventListener("click",function(event){
                var city = event.target.innerText;
                fireApi(city);
            })
            divVar.appendChild(btnVar);
            document.getElementById("storedSearch").appendChild(divVar);
        }
    }
})

// Fire the One Call Api on click of Search button
searchButton.addEventListener("click",function(){  
    document.getElementById("weatherCls").classList.remove("d-none");
    fireApi(inputCity.value);
})

// The method to fire the One Call Api
// Two Api Calls - geo->to get lat,long; onecall->to get current and 5 day forecast data
function fireApi(city) {
    // Geo Api Call
    fetch("http://api.openweathermap.org/geo/1.0/direct?q="+city+"&limit=5&appid="+apiKey)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log("geodata"+data[0]);
        var geoData = data[0];
        if(data.length > 0) {
            // Onecall Api call
            fetch("https://api.openweathermap.org/data/2.5/onecall?units=imperial&&exclude=hourly,minutely&lat="+data[0].lat+"&lon="+data[0].lon+"&appid="+apiKey)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                console.log("onecalldata",data);
                document.getElementById("weatherCls").classList.remove("d-none");

                // Current weather Start
                cityName.textContent = geoData.name + " (" +currentDate + ")"; 
                var currentWeatherIcon = document.getElementById("currentWeatherIcon");
                currentWeatherIcon.setAttribute("src",'https://openweathermap.org/img/w/'+data.current.weather[0].icon+'.png');
                currentTemp.textContent = "Temp: " + data.current.temp + "\u00B0 F";
                currentWind.textContent = " Wind: " + data.current.wind_speed + " MPH";
                currentHumid.textContent = "Humidity: " + data.current.humidity + " %";

                // Show UV data color based on the value
                uvIndex = document.getElementById("uvIndex");
                if(data.current.uvi >10) {
                    uvIndex.style.backgroundColor = "red";
                }else if (data.current.uvi < 10 && data.current.uvi >=5) {
                    uvIndex.style.backgroundColor = "orange";
                } else {
                    uvIndex.style.backgroundColor = "green";
                }
                uvIndex.textContent = data.current.uvi;

                // Current weather End

                // Five day forecast start
                document.getElementById("fiveDayDiv").innerHTML = ''; 
                var fiveDayDiv = document.getElementById("fiveDayDiv");

                for(i=1;i<6;i++) { 
                    nextDate = new Date(dt);
                    nextDate.setDate(nextDate.getDate() + i);

                    var colDiv = document.createElement("div");
                    colDiv.className = "col";
                    colDiv.style = "margin:5px;background-color:blue;color:white";     

                    dateP = document.createElement("p");
                    dateP.textContent = nextDate.toLocaleDateString();
                    colDiv.appendChild(dateP);

                    iconP = document.createElement("p");
                    iconImg = document.createElement("img");
                    iconImg.setAttribute('src','https://openweathermap.org/img/w/'+data.daily[i].weather[0].icon+'.png');
                    iconP.appendChild(iconImg);
                    colDiv.appendChild(iconP);
                    
                    tempP = document.createElement("p");
                    tempP.textContent = "Temp: " + data.daily[i].temp.day + "\u00B0 F";
                    colDiv.appendChild(tempP);

                    tempW = document.createElement("p");
                    tempW.textContent = " Wind: " + data.daily[i].wind_speed + " MPH";
                    colDiv.appendChild(tempW);
                    
                    tempH = document.createElement("p");
                    tempH.textContent = "Humidity: " + data.daily[i].humidity + " %";
                    colDiv.appendChild(tempH);
                    
                    fiveDayDiv.appendChild(colDiv);
                }  
                // Five day forecast end              
            })
            savedCitiesJson = JSON.parse(localStorage.getItem("cities"));
            console.log("savedCitiesJson"+savedCitiesJson);

            var isNewCity = true;
            
            // To check if the city name is searched for the first time
            if(savedCitiesJson != null && savedCitiesJson.length>0) {
                for(i=0;i<savedCitiesJson.length;i++) {
                    if(savedCitiesJson[i].toUpperCase() == city.toUpperCase()) {
                        isNewCity = false;
                    }
                }
            } 
            console.log("isNewCity"+isNewCity);

            // check if its a new city. If yes, add to local storage
            if(isNewCity) {
                savedCities.push(city);
                localStorage.setItem("cities", JSON.stringify(savedCities));
            }
        
        }
        
    })
}