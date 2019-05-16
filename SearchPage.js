'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ActivityIndicator,
  SafeAreaView,
  WebView,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
//import { strings } from './i18n';
import BottomToolbar from 'react-native-bottom-toolbar';
import signalr from 'react-native-signalr';
import ImatisMessageBox from './ImatisMessageBox';
import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
import {callNumber} from './Utils';

function urlForQueryAndPage(key, value, pageNumber) {
  const data = {
      country: 'uk',
      pretty: '1',
      encoding: 'json',
      listing_type: 'buy',
      action: 'search_listings',
      page: pageNumber,
  };
  data[key] = value;

  const querystring = Object.keys(data)
    .map(key => key + '=' + encodeURIComponent(data[key]))
    .join('&');

  return 'https://api.nestoria.co.uk/api?' + querystring;
}

type Props = {};
export default class SearchPage extends Component<Props> {
  static navigationOptions = {
    title: 'Awesome Project',
  };

  constructor(props) {
    super(props);
    this.state = {
      searchString: 'london',
      isLoading: false,
      scanQR: false,
      message: '',
      whiteboardId: '74',
      token: '0BEAA8EB10B78386E0CEE178285234150856D0636B4A9930E648DBE4B2B6487E58626CA58B2645811BD68E39E40D19140B8FA1CA1929BE25E72778228C58FD171F985E68EAAE359F8584E64E4FEF27CAEED6084AF38A16F097E93F2A12C90D893D26B932C6970FD72B26DD7FC5725955AFCF7B8C2D5ADA7EA72CB9CCDFB487B7C953DDA66A7EC53E0F7BF94A86B0B777F3DCB3738FED8B8D2A86976BAC1A29C06D1898BA83456160FB723CFB1A99879904B1995C83071B233E510F7A8894DA7846450F11E71ED3E2EAD0AB202830E94048920C25F67B927B6FF5EC5DE24DC935923B05A65BE3CDB93FDCFAE91F1502AAFC32C722E9C7CD3C5AB96FB072492A64973AFF90FD0D311655E0CB5F9ACB526A03B4E33CF59F3595CC941EED3E89BB83D8CF3B014907290370B298FA4A138B4649A0E7BF4451B9F3EC18F64BE0DFE3639597E1889424B3418AA8C2941FFE016DCC7736FD139D7892E5062BFD1CB96EF1DC93F2454EDE5987CB416419570B2AF3AE88955A535B62EC946EEFC5987259FD7A329FD1A650C87E0802068D5467E1B046E43B23F920BA6AC0565C346FB45AF57EF7E40B12E4F6AE969E69A5A920CA66A8CD20AA61A4B620B78A4F050ED6B86A8A4877041F832F796083220BA0AD4A90283D3871EC433F4700074AE10BB957A4A9DD186629E754290F8DFDF3D7F896060C40531814E4FE192D4CD83F76153DF134ED7A1E07493CD99B85E5AF5FEC04AA3832B4CB0D494E695E0058B479EB683A8335E6DD9D91792BB2DD24A244DE86DF2D6CB96C1E8F2CB9CE6144C343DDFED9A9B092A1520EB3D0285C1A2E8E177F4C3A73E9296899E4F69A018699212511DB3D4EE12709E5F998A467583CAF6B4DFE49986C989ABE5DC9C332DF6D78DF740144378068'
    };
  }

  _setWhiteboardJavascriptFunctions(){
    console.log('_setWhiteboardJavascriptFunctions');
    window.CellValue = null;
    window.isEmpty = null;

    var wbJsFunctions = document.createElement("script");
    wbJsFunctions.setAttribute("class", "wb-js-func");
    wbJsFunctions.setAttribute("type", "text/javascript");
    wbJsFunctions.setAttribute("src", 'https://smartphonetest.imatiscloud.com/imatis/webservices/whiteboard/JavascriptFunctions/whiteboard?id=' + this.state.whiteboardId + '&imatisauthtoken=' + this.state.token);
    document.head.appendChild(wbJsFunctions);

    window.isEmpty = Ext.isEmpty;
    window.CellValue = function () {
        var columnName, rowId, param;
        switch (arguments.length) {
            case 1:
                param = arguments[0];
                break;
            case 2: 
                columnName = arguments[0];
                param = arguments[1];
                break;
            case 3:
                rowId = arguments[0];
                columnName = arguments[1];
                param = arguments[2];
                break;
            default:
                break;
        }

        if (!columnName) {
            return "";
        }

        param = param || 'value';
        //var row = rowId && store ? store.findExact('RowId', rowId, 0) : Mobilix.CurrentRow;
        var record = Mobilix.Whiteboard.findExact(Mobilix.CurrentRow, 'ColumnName', columnName);
        return Mobilix.Whiteboard.getParamValue(record, param);
    }
  }

  componentDidMount() {
    this._checkPermission();
    this._createNotificationListeners();
    //this._setWhiteboardJavascriptFunctions();

    //This is the server under /example/server published on azure.
    const connection = signalr.hubConnection('https://smartphonetest.imatiscloud.com/imatis/webservices/communicationservice/');
    connection.logging = true;
    connection.qs = {'ImatisServiceAuth': this.state.token};

    const proxy = connection.createHubProxy('mainHub');

    //receives broadcast messages from a hub function, called "helloApp"
    proxy.on('handleMessage', function (messageType, data) {
      console.log('SignalR: handleMessage from mainHub with message type: ' + messageType);
    });

    // atempt connection, and handle errors
    connection.start().done(() => {
      console.log('Now connected, connection ID=' + connection.id);

      Alert.alert("Information", "SignalR connected to mainHub !");

      let browser = "AndroidPhone";
      proxy.invoke('sendMessage', JSON.stringify({ type: "detectedBrowser", browser: browser }))
        .done(() => {
          console.log('SignalR: Invocation of detectedBrowser succeeded');

          proxy.invoke('sendMessage', JSON.stringify({ type: "updateOnlineUsers" })).done(function () {
              console.log('SignalR: Invocation of updateOnlineUsers succeeded');
          }).fail(function (error) {
              console.log('SignalR: Invocation of updateOnlineUsers failed. Error: ' + error);
          });
        }).fail(() => {
          console.warn('Something went wrong when calling server, it might not be up and running?')
        });

    }).fail(() => {
      console.log('Failed');
    });

    //connection-handling
    connection.connectionSlow(() => {
      console.log('We are currently experiencing difficulties with the connection.')
    });

    connection.error((error) => {
      const errorMessage = error.message;
      let detailedError = '';
      if (error.source && error.source._response) {
        detailedError = error.source._response;
      }
      if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
        console.log('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14')
      }
      console.debug('SignalR error: ' + errorMessage, detailedError)
    });
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async _createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const { title, body } = notification;
        this.showAlert(title, body);
    });
  
    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    });
  
    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }
  
  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  async _checkPermission() {
    console.log('_checkPermission');
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
        this._getToken();
    } else {
        this._requestPermission();
    }
  }

  async _getToken() {
    console.log('_getToken');
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
        console.log('messaging() getToken');
        fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {            
            // user has a device token
            await AsyncStorage.setItem('fcmToken', fcmToken);
        }
    }
    console.log('token: ' + fcmToken);
  }

  async _requestPermission() {
    console.log('_requestPermission');
    try {
        await firebase.messaging().requestPermission();
        // User has authorised
        this.getToken();
    } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
    }
  }

  _onSearchTextChanged = (event) => {
    console.log('_onSearchTextChanged');
    this.setState({ searchString: event.nativeEvent.text });
    console.log('Current: '+this.state.searchString+', Next: '+event.nativeEvent.text);
  };

  _executeQuery = (query) => {
    console.log(query);
    this.setState({ isLoading: true });

    fetch(query)
    .then(response => response.json())
    .then(json => this._handleResponse(json.response))
    .catch(error =>
      this.setState({
        isLoading: false,
        message: 'Something bad happened ' + error
    }));
  };

  _handleResponse = (response) => {
    this.setState({ isLoading: false , message: '' });
    if (response.application_response_code.substr(0, 1) === '1') {
      this.props.navigation.navigate(
        'Results', {listings: response.listings});
    } else {
      this.setState({ message: 'Location not recognized; please try again.'});
    }
  };
  
  _onSearchPressed = () => {
    const query = urlForQueryAndPage('place_name', this.state.searchString, 1);
    this._executeQuery(query);
  };

  _handleMessage = (e) => {
    const message = e.nativeEvent.data
    console.log('message from webview:', message)
    this.messagebox.showMessageBox('Message title', message);
  };

  _onExecuteJs = () => {
    this.webView.injectJavaScript(`
      (function () {
        var res = editfields();
        window.postMessage(res);
      })();
    `);
  };

  _onScanQR = () => {
    this.props.navigation.navigate(
      'QrScanner', {canDetectBarcode: true});
  };

  takePicture = async function() {
    this.props.navigation.navigate(
      'CameraScreen', {canSnap: true});
  };

  _onPhoneCall = () => {
    callNumber('123456789');
  };

  render() {
    console.log('SearchPage.render');
    const spinner = this.state.isLoading ?
      <ActivityIndicator size='large'/> : null;

    const html = `<html><body>
    <script src=https://smartphonetest.imatiscloud.com/imatis/webservices/whiteboard/JavascriptFunctions/whiteboard?id=${this.state.whiteboardId}&imatisauthtoken=${this.state.token}></script>
    <script>
    window.CellValue = function(){
      return '';
    }
    </script>
                  </body></html>`;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.container}>
          
          <View style={styles.flowRight}>
            <TextInput
            underlineColorAndroid={'transparent'}
            style={styles.searchInput}
            value={this.state.searchString}
            onChange={this._onSearchTextChanged}
            placeholder='Search via name or postcode'/>
            <Button
                onPress={this._onSearchPressed}
                color='#48BBEC'
                title='Search'
            />
          </View>          
          <Image source={require('./Resources/house.png')} style={styles.image}/>
          <Button
              onPress={this._onExecuteJs}
              color='#48BBEC'
              title='Execute Js function'
          />
          
          {spinner}
          <Text style={styles.description}>{this.state.message}</Text>
          <WebView style={{opacity:0}}
            source={{ html: html }}
            javaScriptEnabled={true}
            ref={el => this.webView = el}
            onMessage={this._handleMessage}
          />
          <ImatisMessageBox
            ref={el => this.messagebox = el}
          />
          
          <Button
              onPress={this._onScanQR}
              style={{marginTop:10}}
              color='#48BBEC'
              title='Scan QR'
          />
          <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
              <Text style={{ fontSize: 14 }}> Take photo </Text>
            </TouchableOpacity>
          </View>
          <Button
              onPress={this._onPhoneCall}
              style={{marginTop:10}}
              color='#48BBEC'
              title='Phone call'
          />
        </View>
        <BottomToolbar>
            <BottomToolbar.Action
              title="Edit"
              onPress={(index, propsOfThisAction) =>
                alert(index + ' ' + JSON.stringify(propsOfThisAction))
              }
            />
            <BottomToolbar.Action
              title="Copy ULR"
              onPress={(index, propsOfThisAction) =>
                alert(index + ' ' + JSON.stringify(propsOfThisAction))
              }
            />
            <BottomToolbar.Action
              title="Delete"
              onPress={(index, propsOfThisAction) =>
                alert(index + ' ' + JSON.stringify(propsOfThisAction))
              }
            />
          </BottomToolbar>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
    description: {
      marginBottom: 20,
      fontSize: 18,
      textAlign: 'center',
      color: '#656565'
    },
    container: {
      padding: 30,      
      flex: 1,
      alignItems: 'center'
    },
    flowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
      },
      searchInput: {
        height: 36,
        padding: 4,
        marginRight: 5,
        flexGrow: 1,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#48BBEC',
        borderRadius: 8,
        color: '#48BBEC',
      },
      image: {
        width: 217,
        height: 138,
      },
      preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
      },
  });