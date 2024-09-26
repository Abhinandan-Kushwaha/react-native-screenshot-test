/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { withScreenShotTest } from './src/withShot';

const App = () => {
  return withScreenShotTest(
    [
      {
        component: () => <Text>Hey there</Text>,
        title: 'It is a text',
        id: 't1'
      },
      {
        component: () => <View style={{height:100,width:130,backgroundColor:'lightgreen'}} />,
        title: 'It is a text',
        id: 't2'
      }
    ]
  )
}
export default App;
