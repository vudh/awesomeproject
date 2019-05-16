import React, { Component } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
  SlideAnimation,
  ScaleAnimation,
} from 'react-native-popup-dialog';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContentView: {
    // flex: 1,
    paddingLeft: 18,
    paddingRight: 18,
    // backgroundColor: '#000',
    // opacity: 0.4,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  navigationBar: {
    borderBottomColor: '#b5b5b5',
    borderBottomWidth: 0.5,
    backgroundColor: '#ffffff',
  },
  navigationTitle: {
    padding: 10,
  },
  navigationButton: {
    padding: 10,
  },
  navigationLeftButton: {
    paddingLeft: 20,
    paddingRight: 40,
  },
  navigator: {
    flex: 1,
    // backgroundColor: '#000000',
  },
  customBackgroundDialog: {
    opacity: 0.5,
    backgroundColor: '#000',
  },
});

export default class ImatisMessageBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
          show: false,
          title: '',
          content:''
        };
      }

    showMessageBox(title, content){
        this.setState({
            show: true,
            title: title,
            content: content
        })
    }

    render(){
        return (
            <Dialog
                onDismiss={() => {
                    this.setState({ show: false });
                }}
                ref={el => this.dialog = el}
                width={0.9}
                visible={this.state.show}
                rounded
                actionsBordered
                // actionContainerStyle={{
                //   height: 100,
                //   flexDirection: 'column',
                // }}
                dialogTitle={
                    <DialogTitle
                    title={this.state.title}
                    style={{
                        backgroundColor: '#F7F7F8',
                    }}
                    hasTitleBar={false}
                    align="left"
                    />
                }
                footer={
                    <DialogFooter>
                    <DialogButton
                        text="CANCEL"
                        bordered                        
                        onPress={() => {
                        this.setState({ show: false });
                        }}
                        key="button-1"
                    />
                    <DialogButton
                        text="OK"
                        bordered
                        onPress={() => {
                        this.setState({ show: false });
                        }}
                        key="button-2"
                    />
                    </DialogFooter>
                }
                >
                <DialogContent
                    style={{
                    backgroundColor: '#F7F7F8',
                    }}
                >
                    <Text>{this.state.content}</Text>
                </DialogContent>
            </Dialog>
        )
    }
}