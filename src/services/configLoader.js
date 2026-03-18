import yaml from 'js-yaml';

/**
 * Load values.yaml from the public folder and extract cameras
 * that have stream_enable: true.
 *
 * Returns an array of camera descriptors:
 * [
 *   {
 *     iocName:    "camerasim",
 *     iocPrefix:  "EUAPS:CAM",
 *     deviceName: "SIM01",
 *     pvPrefix:   "EUAPS:CAM:SIM01",
 *     streamUrl:  "<computed from beamline/namespace/service>",
 *     httpPort:   8082,
 *     beamline:   "euaps",
 *     namespace:  "euaps",
 *     domain:     "k8sda.lnf.infn.it",
 *   },
 *   ...
 * ]
 */
export async function loadCamerasFromConfig(yamlPath = '/values.yaml') {
  const resp = await fetch(yamlPath);
  if (!resp.ok) throw new Error(`Failed to load ${yamlPath}: ${resp.status}`);
  const text = await resp.text();
  const config = yaml.load(text);

  const beamline = config.beamline || '';
  const namespace = config.namespace || beamline;
  const domain = config.epik8namespace || '';

  const iocs = config.epicsConfiguration?.iocs || [];
  const cameras = [];

  for (const ioc of iocs) {
    if (!ioc.stream_enable) continue;

    const iocPrefix = ioc.iocprefix || '';
    const httpPort = ioc.service?.http?.port || 8080;
    const devices = ioc.devices || [];

    for (const dev of devices) {
      const deviceName = dev.name;
      const pvPrefix = `${iocPrefix}:${deviceName}`;
      // MJPEG stream URL: <beamline>-<iocname>.<domain>:<port>/<DEVICE>.mjpg
      const streamHost = `${namespace}-${ioc.name}.${domain}`;
      const streamUrl = `//${streamHost}:${httpPort}/${deviceName}.mjpg`;

      cameras.push({
        iocName: ioc.name,
        iocPrefix,
        deviceName,
        pvPrefix,
        streamUrl,
        httpPort,
        beamline,
        namespace,
        domain,
      });
    }
  }

  return { cameras, config };
}
