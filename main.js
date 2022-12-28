import "/style.css"
import { getWeather } from "./weather"  
import { ICON_MAP } from "./iconMap"
import axios from "axios"

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({coords}){
  getWeather(
    coords.latitude, 
    coords.longitude, 
    currentTimeZone
  )
  .then(renderWeather)
  .catch(error => {
    console.error(error)
    alert("Error getting weather.")
  })  

  getUserLocation(coords.latitude, coords.longitude)
}

function positionError(){
  alert("There was an error getting your location. Please allow us to use your location and refresh the page")
}

const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function renderWeather({current, daily, hourly}){
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}){
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode){
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")

function renderCurrentWeather(current){
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)

  changeBackground(ICON_MAP.get(current.iconCode))
}


const DAY_FORMATTER = Intl.DateTimeFormat(undefined, { weekday: "long"})
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily){
  dailySection.innerHTML = ""
  daily.forEach(day => {
     const element = dayCardTemplate.content.cloneNode(true)
     setValue("temp", day.maxTemp, { parent: element })
     setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
     element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
     dailySection.append(element)
  })
}


const HOUR_FORMATTER = Intl.DateTimeFormat(undefined, { hour: "numeric"})
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly){
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
     const element = hourRowTemplate.content.cloneNode(true)
     setValue("temp", hour.temp, { parent: element })
     setValue("fl-temp", hour.feelsLike, { parent: element })
     setValue("wind", hour.windSpeed, { parent: element })
     setValue("precip", hour.precip, { parent: element })
     setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
     setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
     element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
     hourlySection.append(element)
  })
}


//https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY

async function getUserLocation(lat, lon){
  const api_key = '0f89509622aa42239bbf3a52a86c85a1'

  let where = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${api_key}`)
  .then(data => {
    return data.data.results[0].formatted
  })

  document.querySelector("[data-location]").innerHTML = `${where}` 

}


function changeBackground(weatherCode){
  let chosenBackground = ''

  switch(weatherCode){
    case "sun":
      chosenBackground = "https://media1.popsugar-assets.com/files/thumbor/XdZCH91AHCuEdnfsfTlsf1PjX7U/fit-in/728xorig/filters:format_auto-!!-:strip_icc-!!-/2019/07/12/789/n/1922441/f9cc294c34316a54_GettyImages-941097280/i/sunny-day.jpg"
    break;

    case "cloud-sun":
      chosenBackground = "https://www.daytondailynews.com/resizer/tE24115VorR0io_ZxJKgwhOd8dY=/814x458/cloudfront-us-east-1.images.arcpublishing.com/coxohio/GT5JMZURAZPTCQPQRHKE2ZHKPY.jpg"
    break;

    case "cloud":
      chosenBackground = "https://thumbs.gfycat.com/BrownIllegalChafer-size_restricted.gif"
    break;

    case "smog":
      chosenBackground = ""
    break;

    case "cloud-showers-heavy":
      chosenBackground = ""
    break;

    case "snowflake":
      chosenBackground = ""
    break;

    case "cloud-bolt":
      chosenBackground = ""
    break;

    default:
    break;
  }

  document.body.style.background = `url(${chosenBackground})`;
  document.body.style.backgroundSize = "contain"
}
