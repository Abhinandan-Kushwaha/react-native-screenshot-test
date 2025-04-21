interface Component {
  id: string;
  title: string;
  description: string;
  maxWidth: number;
  backgroundColor: string;
}

export interface Metadata {
  components: Component[];
}

export const addScreenShotToPath = async (
  imageString: string,
  id: string,
  path: string,
  serverUrl: string,
  showDiffInGrayScale: boolean,
) => {
  const option = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({data: imageString, id, path, showDiffInGrayScale}),
  };

  const url = `${serverUrl}/data`;
  const res = {status: ''};

  try {
    await fetch(url, option);
    res.status = 'success';
  } catch (err) {
    res.status = 'error';
    throw err;
  }
  return res;
};

export const generateHtmlFile = async (
  path: string,
  metaData: Metadata,
  serverUrl: string,
  maxWidth: number,
  backgroundColor: string,
) => {
  const option = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({path, maxWidth: maxWidth, backgroundColor, metaData}),
  };

  const url = `${serverUrl}/generate`;
  const res = {status: ''};

  try {
    await fetch(url, option);
    res.status = 'success';
  } catch (err) {
    res.status = 'error';
  }

  return res;
};
