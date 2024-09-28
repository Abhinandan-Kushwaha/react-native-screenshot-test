import {ReactElement, useRef, useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  View,
  Dimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import {Metadata, addScreenShotToPath, generateHtmlFile} from './utils';
import RNFS from 'react-native-fs';
import {Loader, ModalBody} from './modalBody';

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

const relativePathToScreenshotTestServer = '../../../'; // since the server code will be in server.js present inside node_modules/screenshot-test-server/dist folder

export const defaultConfig = {
  path: 'ss-test',
  localhostUrl: isAndroid ? 'http://10.0.2.2' : 'http://127.0.0.1',
  port: '8080',
  batchSize: 10,
  maxWidth: 500,
  backgroundColor: 'transparent',
  showDiffInGrayScale: false,
  quality: 0.9,
};

export interface ScreenshotConfig {
  path?: string;
  localhostUrl?: string;
  port?: string;
  batchSize?: number;
  maxWidth?: number;
  backgroundColor?: string;
  showDiffInGrayScale?: boolean;
  quality?: number;
}

export interface Components {
  component: (props?: any) => ReactElement;
  title: string;
  id: string;
  description?: string;
  showDiffInGrayScale?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
  quality?: number;
}

export const withScreenShotTest = (
  components: Components[],
  screenshotConfig?: ScreenshotConfig,
) => {
  const {
    localhostUrl = defaultConfig.localhostUrl,
    port = defaultConfig.port,
    batchSize = defaultConfig.batchSize,
    maxWidth = defaultConfig.maxWidth,
    backgroundColor = defaultConfig.backgroundColor,
    showDiffInGrayScale,
    quality = defaultConfig.quality,
  } = screenshotConfig ?? {};

  let path = screenshotConfig?.path ?? defaultConfig.path;

  if (path.startsWith('/') || path.startsWith('./')) {
    path = path.split('/')[1];
  }

  path = relativePathToScreenshotTestServer + path;
  const offset = useRef(0);

  const [componentsCurrentlyRendered, setComponentsCurrentlyRendered] =
    useState<Components[]>(components.slice(offset.current, batchSize));

  const viewShotRefs: any[] = components.map(_ => useRef(null));
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState<Function>(() => null);

  const onModalDismiss = () => {
    if (loading) return;
    setModalVisible(false);
    setModalTitle('');
    setModalBody(() => null);
  };

  const captureView = (
    viewShotRefs: any,
    componentsCurrentlyRendered: Components[],
  ) => {
    if (viewShotRefs[offset.current].current) {
      setModalVisible(true);
      setLoading(true);
      const ps = componentsCurrentlyRendered.map(async (component, index) => {
        const currentViewshotRef = viewShotRefs[offset.current + index].current;
        if (currentViewshotRef) {
          const uri = await currentViewshotRef.capture();
          const data = await RNFS.readFile(uri, 'base64');

          await addScreenShotToPath(
            data,
            component.id,
            path,
            localhostUrl,
            port,
            component.showDiffInGrayScale ??
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
          setLoading(false);
          if (res.status === 'success') {
            const newOffset = offset.current + batchSize;
            if (newOffset < components.length) {
              offset.current = newOffset;
              const newComponents = components.slice(
                newOffset,
                newOffset + batchSize,
              );
              setComponentsCurrentlyRendered(newComponents);
              captureView(viewShotRefs, newComponents);
            } else {
              const splitPath = path.split('/');
              const folder = splitPath[splitPath.length - 1];

              setModalTitle('Screenshot tests generated successfully!');
              setModalBody(() => (
                <Text>
                  Open the file
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: '#23569E',
                    }}>{` ${folder}/test.html `}</Text>
                  in your browser to see the reports.
                </Text>
              ));
            }
          } else {
            setModalTitle('Something went wrong while generating HTML!');
          }
        })
        .catch((err: any) => {
          setLoading(false);
          if (err?.message === 'Network request failed') {
            setModalTitle('Server NOT running!! Please start the test server');
            setModalBody(() => (
              <>
                <Text>
                  1. In the
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                    }}>{` package.json `}</Text>
                  under
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                    }}>{` "scripts" `}</Text>
                  add-
                </Text>
                <Text
                  style={{
                    color: '#23569E',
                    marginVertical: 4,
                  }}>
                  {`"ss-test"`}
                  <Text style={{color: 'brown'}}>
                    {` :   "cd ./node_modules/screenshot-test-server/dist && node server.js"`}
                  </Text>
                </Text>
                <Text style={{marginTop: 6}}>
                  2. Run the command-
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    {` "npm run ss-test" `}
                  </Text>
                </Text>
                <Text style={{marginTop: 6}}>
                  3. Press the "Capture and Compare" button again.
                </Text>
              </>
            ));
          } else {
            setModalTitle('Something went wrong!');
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
        <Text>{`Rendering items from ${offset.current} to ${
          offset.current + batchSize
        }`}</Text>
        <ScrollView>
          {[...componentsCurrentlyRendered].map((comp: any, index: number) => {
            return (
              <ViewShot
                key={comp.id}
                ref={viewShotRefs[offset.current + index]}
                options={{format: 'png', quality: comp.quality ?? quality}}>
                {comp.component()}
              </ViewShot>
            );
          })}
        </ScrollView>
      </View>
      <TouchableOpacity
        onPress={() => captureView(viewShotRefs, componentsCurrentlyRendered)}
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
      {modalVisible ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onModalDismiss}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: screenWidth,
            height: screenHeight,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}>
          {loading ? (
            <Loader offset={offset.current} batchSize={batchSize} />
          ) : (
            <ModalBody
              title={modalTitle}
              body={modalBody}
              onDismiss={onModalDismiss}
            />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
