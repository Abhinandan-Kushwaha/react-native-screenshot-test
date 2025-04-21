import {useEffect, useRef, useState} from 'react';
import {ScrollView, Text, View, Dimensions} from 'react-native';
import {Metadata, addScreenShotToPath, generateHtmlFile} from './utils';
import {Components, ScreenshotConfig, defaultConfig} from './withScreenShot';

const {height: screenHeight} = Dimensions.get('window');

const relativePathToScreenshotTestServer = '../../../'; // since the server code will be in server.js present inside node_modules/screenshot-test-server/dist folder

const withScreenShotTestHeadLess = (
  components: Components[],
  screenshotConfig?: ScreenshotConfig,
) => {
  const {
    serverUrl = defaultConfig.serverUrl,
    batchSize = defaultConfig.batchSize,
    maxWidth = defaultConfig.maxWidth,
    backgroundColor = defaultConfig.backgroundColor,
    showDiffInGrayScale,
    quality = defaultConfig.quality,
  } = screenshotConfig ?? {};

  useEffect(() => {
    setTimeout(() => {
      captureView(viewShotRefs, componentsCurrentlyRendered);
    }, 1000);
  }, []);

  let path = screenshotConfig?.path ?? defaultConfig.path;

  if (path.startsWith('/') || path.startsWith('./')) {
    path = path.split('/')[1];
  }

  path = relativePathToScreenshotTestServer + path;
  const offset = useRef(0);

  const [componentsCurrentlyRendered, setComponentsCurrentlyRendered] =
    useState<Components[]>(components.slice(offset.current, batchSize));

  const viewShotRefs: any[] = components.map(_ => useRef(null));

  const captureView = async (
    viewShotRefs: any,
    componentsCurrentlyRendered: Components[],
  ) => {
    if (viewShotRefs[offset.current].current) {
      const ps = componentsCurrentlyRendered.map(async (component, index) => {
        const currentViewshotRef = viewShotRefs[offset.current + index].current;
        if (currentViewshotRef) {
          await addScreenShotToPath(
            '',
            component.id,
            path,
            serverUrl,
            component.showDiffInGrayScale ??
              showDiffInGrayScale ??
              defaultConfig.showDiffInGrayScale,
          );
        }
      });

      const metaData: Metadata = {
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
            serverUrl,
            maxWidth,
            backgroundColor,
          );
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

              console.log('Screenshot tests generated successfully!');
              console.log(
                `Open the file ${folder}/test.html in your browser to see the reports.`,
              );
            }
          } else {
            console.log('Something went wrong while generating HTML!');
          }
        })
        .catch((err: any) => {
          console.log('err...', err);
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
              <View
                key={comp.id}
                id={comp.id}
                ref={viewShotRefs[offset.current + index]}
                // options={{format: 'png', quality: comp.quality ?? quality}}
              >
                {comp.component()}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default withScreenShotTestHeadLess;
