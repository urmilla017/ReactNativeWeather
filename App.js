import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
Icon.loadFont();
FeatherIcon.loadFont();

const googleAPIKey = '';
const weatherAPIKey = '';

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: {},
      text: '',
      cityName: 'Stuttgart',
      temperature: '',
      feelsLike: '',
      pressure: '',
      humidity: '',
      clouds: '',
      visibility: '',
      windSpeed: '',
      weatherDescription: '',
      weatherIcon: 'http://openweathermap.org/img/wn/11d@2x.png',
      location: null,
      latitude: null,
      longitude: null
    };
  }

  componentDidMount(){
    Geolocation.getCurrentPosition(
      position => {
        const location = JSON.stringify(position);
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.weatherForecastFetch(latitude, longitude);
        this.setState({
          location: position,
          latitude,
          longitude
        });
      },
      error => console.log('error:' + error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  onChangeText = (text) => {
    this.setState({
      text: text
    })
  }

  onPressLearnMore = () => {
    console.log('button pressed');
    if(this.state.text != undefined) {
      this.setState({
        cityName: this.state.text
      })
      this.onUpdate(this.state.text);
    } else {
      console.log('nothing in text on press');
    }
  }

  getTimeFromUTC = (utcDate) => {
    var date = new Date(utcDate*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes().toString().substr(0, 1);;
    var seconds = "0" + date.getSeconds().toString().substr(0, 1);;
    return hours + ':' + minutes;
  }

  createDailyStuff = (dailyFore) => {
    let dailyStuff = [];
    let dailySingleStuff = {};
    for(let i = 0; i < dailyFore.length; i++) {
      var unixtimestamp = dailyFore[i].dt;
      var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var date = new Date(unixtimestamp*1000);
      var year = date.getFullYear();
      var month = months_arr[date.getMonth()];
      var day = ("0" + date.getDate()).slice(-2);
      var dayName = days[date.getDay()];
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      var convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      var dailyIcon = "http://openweathermap.org/img/wn/" + dailyFore[i].weather[0].icon + "@2x.png";
      dailySingleStuff = {
        dateOfMonth: day,
        dayOfWeek: dayName,
        month: month,
        minTemp: dailyFore[i].temp.min.toFixed(2),
        maxTemp: dailyFore[i].temp.max.toFixed(2),
        dailyIcon: dailyIcon
      }
      dailyStuff.push(dailySingleStuff);
    }
    return dailyStuff;
  }

  weatherForecastFetch = (lat, lon) => {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&units=imperial&appid=" + weatherAPIKey)
    .then(response => response.json())
    .then((responseJson)=> {
      iconImage = "http://openweathermap.org/img/wn/" + responseJson.current.weather[0].icon + "@2x.png";
      var dailyStuff = this.createDailyStuff(responseJson.daily);
      this.setState({
       loading: false,
       temperature: responseJson.current.temp,
       feelsLike: responseJson.current.feels_like,
       pressure: responseJson.current.pressure,
       humidity: responseJson.current.humidity,
       clouds: responseJson.current.clouds,
       visibility: responseJson.current.visibility,
       windSpeed: responseJson.current.wind_speed,
       weatherDescription: this.upperCaseText(responseJson.current.weather[0].description),
       sunrise: this.getTimeFromUTC(responseJson.current.sunrise),
       sunset: this.getTimeFromUTC(responseJson.current.sunset),
       weatherIcon: iconImage,
       dataSource: responseJson.daily,
       checkUpdate: true,
       dailyStuff: dailyStuff
      })
    })
    .catch(error=>console.log(error));
  }

  onUpdate = (name) => {
    console.log('cityname on update:' + name);
    console.log('onUpdate');
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + name + '&key=' + googleAPIKey)
      .then((response) => response.json())
      .then((responseJson) => {
        var lat = responseJson.results[0].geometry.location.lat;
        var lon = responseJson.results[0].geometry.location.lng;
        this.setState({
          latitude: lat.toFixed(3),
          longitude: lon.toFixed(3)
        });
        this.weatherForecastFetch(lat, lon);
    });
  }

  upperCaseText = (textToChange) => {
    text = textToChange.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
    return text;
  }

  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={{flex:1, flexDirection:'column', justifyContent:'center'}}>
          <View style={{flexDirection:'row', top: 40}}>
            <TextInput
              style={styles.textInputStyle}
              onChangeText={this.onChangeText}
              placeholder='Search...'
              placeholderTextColor='grey'
              clearButtonMode='always'
              spellCheck={false}
              autoCorrect={false}
            />
            <View style={{ flex:0.1, top: 15 }}>
              <TouchableOpacity onPress={this.onPressLearnMore}>
                <Icon name="search" size={30} color='grey' />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cityNameStyle}>
            <Text style={{ textAlign: 'center', fontSize: 30, color: 'white' }}>{this.state.cityName}</Text>
          </View>

          <View style={[styles.viewBoxStyle,{ height: 390}]}>
            <View style={{ flexDirection:'row', padding: 5  }}>
              <View style={{ flex:0.6 }}>
                <Text style={{ color: 'white', fontSize: 40 }}>
                  {this.state.temperature}°
                </Text>
                <Text style={{ color: 'white', fontSize: 15, paddingTop: 3}}>
                  Feels like {this.state.feelsLike}°
                </Text>
              </View>
              <View style={{ flex: 0.3, borderWidth: 1, borderColor: 'black', padding: 5}}>
                <Image
                  style={{width: 80, height: 80, top: -20, left: 15 }}
                  source={{
                    uri: this.state.weatherIcon,
                  }}
                />
              <Text style={{textAlign: 'center', top: -40, color: 'white', fontSize: 15, paddingVertical: 5}}>
                {this.state.weatherDescription}
              </Text>
              </View>
            </View>
            <View style={{ flexDirection:'row', top: -40 }}>
              <FeatherIcon style={{ left: 100 }} name="sunrise" size={30} color='rgb(255, 138, 0)' />
              <FeatherIcon style={{ left: 180 }} name="sunset" size={30} color='rgb(255, 138, 0)' />
            </View>
            <View style={{ flexDirection:'row', top: -40 }}>
              <Text style={[styles.basicTextStyle,{ left: 90}]}>{this.state.sunrise} am</Text>
              <Text style={[styles.basicTextStyle,{ left: 140}]}>{this.state.sunset} pm</Text>
            </View>
            <View style={{top: -40, flexDirection: 'row'}}>
              <View style={{ flex: 0.7, paddingLeft: 15}}>
                <Text style={styles.basicTextStyle}>Wind Speed</Text>
                <Text style={styles.basicTextStyle}>Clouds</Text>
                <Text style={styles.basicTextStyle}>Visibility</Text>
                <Text style={styles.basicTextStyle}>Humidity</Text>
                <Text style={styles.basicTextStyle}>Pressure</Text>
              </View>
              <View style={{ flex: 0.4 }}>
                <Text style={styles.basicTextStyle}>{this.state.windSpeed} mph</Text>
                <Text style={styles.basicTextStyle}>{this.state.clouds} %</Text>
                <Text style={styles.basicTextStyle}>{this.state.visibility} m</Text>
                <Text style={styles.basicTextStyle}>{this.state.humidity} %</Text>
                <Text style={styles.basicTextStyle}>{this.state.pressure} hPa</Text>
              </View>
            </View>
          </View>

          <View style={{ top: 30, height: 50 }}>
            <Text style={{textAlign: 'center', color: 'white', fontSize: 20}}>Weekly Forecast</Text>
          </View>
          <View style={[styles.viewBoxStyle,{ height: 537}]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.basicTextStyle,{ left: 20}]}>Date</Text>
              <Text style={[styles.basicTextStyle,{ left: 70}]}>Min</Text>
              <Text style={[styles.basicTextStyle,{ left: 130}]}>Max</Text>
              <Text style={[styles.basicTextStyle,{ left: 190}]}>Weather</Text>
            </View>

            {
              this.state.dailyStuff && this.state.dailyStuff.map((forecast, key) => {
                return (
                  <View key={key} style={{flexDirection: 'row', borderBottomWidth: 1, borderColor: 'grey', paddingBottom: 10}}>
                    <Text style={[styles.weeklyForecastStyle,{ fontSize: 15, top: 0, left: 20}]}>{forecast.month}</Text>
                    <Text style={[styles.weeklyForecastStyle,{ fontSize: 30, top: 14, left: -12}]}>{forecast.dateOfMonth}</Text>
                    <Text style={[styles.weeklyForecastStyle,{ fontSize: 20, top: 15, paddingLeft: 30}]}>{forecast.minTemp}</Text>
                    <Text style={[styles.weeklyForecastStyle,{ fontSize: 20, top: 15, paddingLeft: 30}]}>{forecast.maxTemp}</Text>
                      <Image
                      style={{ width: 50, height: 50, top: -20, left: 55, top: 2 }}
                        source={{
                          uri: forecast.dailyIcon,
                        }}
                      />
                  </View>
                );
              })
            }
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'black'
  },
  cityNameStyle: {
    top: 30,
    margin: 10,
    padding: 10
  },
  textInputStyle: {
    flex:0.9,
    margin: 10,
    height: 40,
    color:'grey',
    padding: 10,
    fontSize: 18,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 12
  },
  basicTextStyle: {
    color: 'white',
    fontSize: 15,
    paddingVertical: 10
  },
  weeklyForecastStyle: {
    color: 'white',
    paddingVertical: 5
  },
  viewBoxStyle: {
    margin: 10,
    top: 20,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10
  }
});
