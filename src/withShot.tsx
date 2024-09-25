import React, {ReactElement, useRef} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  View,
  Dimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import {Metadata, addScreenShotToPath, generateHtmlFile} from './utils';
import RNFS from 'react-native-fs';

const screenHeight = Dimensions.get('window').height;
const isAndroid = Platform.OS === 'android';

export const defaultConfig = {
  path: '../../../screenshot-test',
  localhostUrl: isAndroid ? 'http://10.0.2.2' : 'http://127.0.0.1',
  port: '8080',
  maxWidth: 500,
  backgroundColor: 'transparent',
  showDiffInGrayScale: false,
};

export interface ScreenshotConfig {
  path?: string;
  localhostUrl?: string;
  port?: string;
  maxWidth?: number;
  backgroundColor?: string;
  showDiffInGrayScale?: boolean;
}

export interface Components {
  component: (props?: any) => ReactElement;
  title: string;
  id: string;
  description?: string;
  showDiffInGrayScale?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
}

export const withScreenShot = (
  components: Components[],
  screenshotConfig?: ScreenshotConfig,
) => {
  const {
    path = defaultConfig.path,
    localhostUrl = defaultConfig.localhostUrl,
    port = defaultConfig.port,
    maxWidth = defaultConfig.maxWidth,
    backgroundColor = defaultConfig.backgroundColor,
    showDiffInGrayScale,
  } = screenshotConfig ?? {};
  const viewShotRefs: any[] = components.map(_ => useRef(null));

  const captureView = () => {
    if (viewShotRefs[0].current) {
      const ps = viewShotRefs.map(async (viewShotRef, index) => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          const data = await RNFS.readFile(uri, 'base64');

          await addScreenShotToPath(
            data,
            components[index].id,
            path,
            localhostUrl,
            port,
            components[index].showDiffInGrayScale ??
              showDiffInGrayScale ??
              defaultConfig.showDiffInGrayScale,
          );
        }
      });

      const metaData: Metadata = {
        port,
        components: components.map(comp => {
          const {
            id,
            title,
            description = '',
            maxWidth = 0,
            backgroundColor = '',
          } = comp;
          return {id, title, description, maxWidth, backgroundColor};
        }),
      };

      Promise.all(ps)
        .then(async () => {
          const res = await generateHtmlFile(
            path,
            metaData,
            localhostUrl,
            port,
            maxWidth,
            backgroundColor,
          );
          if (res.status === 'success') {
            const splitPath = path.split('/');
            const folder = splitPath[splitPath.length - 1];
            Alert.alert(
              'Screenshot tests generated successfully!',
              `Open the file ${folder}/test.html in your browser to see the reports.`,
            );
          } else {
            Alert.alert('Something went wrong!');
          }
        })
        .catch((err: any) => {
          if (err?.message === 'Network request failed') {
            Alert.alert(
              'Please start the test server',
              '1. Navigate to "./node_modules/screenshot-test-server/dist"\n2. Run the command- "node server.js"\n3. Press the "Capture and Compare" button again.',
            );
          } else {
            Alert.alert('Something went wrong!');
          }
        });
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#aaa'}}>
      <View
        style={{
          borderWidth: 2,
          borderRadius: 4,
          padding: 8,
          margin: 6,
          maxHeight: screenHeight - 85,
          backgroundColor: screenshotConfig?.backgroundColor ?? 'white',
        }}>
        <ScrollView>
          {components.map((comp: any, index: number) => (
            <ViewShot
              key={comp.id}
              ref={viewShotRefs[index]}
              options={{format: 'png', quality: 0.9}}>
              {comp.component()}
            </ViewShot>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        onPress={captureView}
        style={{
          borderRadius: 4,
          backgroundColor: '#111',
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: isAndroid ? 10 : 6,
          marginTop: 4,
          marginBottom: 12,
          maxWidth: 220,
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 16}}>Capture and Compare</Text>
      </TouchableOpacity>
    </View>
  );
};
