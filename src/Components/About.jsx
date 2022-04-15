import { Collapse, Typography } from 'antd';

const { Panel } = Collapse;

export const About = () => {
  return (
    <div>
      <p>
        The Game Datacards website is a tool to help Tabletop Wargaming players around the world create their own custom
        datacards for printing.
      </p>
      <b>Thank you to:</b>
      <ul>
        <li>
          <p>External data sources are powered by Wahapedia.</p>
        </li>
        <li>
          <p>
            Card design &amp; icons are created by Locequen. (
            <Typography.Link link='https://github.com/Locequen/40k-Data-Card'>
              Locequen / 40k-Data-Card on Github
            </Typography.Link>
            )
          </p>
        </li>
      </ul>

      <b>Planned features:</b>
      <ul>
        <li>More external datasources (OPR and more games)</li>
        <li>Armylist creation?</li>
      </ul>

      <Collapse defaultActiveKey={'1.0.0'}>
        <Panel header={'Version 1.0.0'} key={'1.0.0'}>
          <b>Changelog</b>
          <ul>
            <li>Added ability to fully customize all sections on the card.</li>
            <li>Auto-hide the header for empty sections on a card.</li>
            <li>Added a sharing page to share your setup with other players.</li>
            <li>Added the ability to add / delete / rename categories.</li>
            <li>Added the ability to drag &amp; drop cards into categories.</li>
            <li>Added an prompt when changing to a different card and not saving.</li>
          </ul>
        </Panel>
        <Panel header={'Version 0.5.0'} key={'0.5.0'}>
          <b>Changelog</b>
          <ul>
            <li>Added more printing options.</li>
          </ul>
        </Panel>
        <Panel header={'Version 0.4.0'} key={'0.4.0'}>
          <b>Changelog</b>
          <ul>
            <li>Added a json export / import function.</li>
          </ul>
        </Panel>
        <Panel header={'Version 0.3.3'} key={'0.3.3'}>
          <b>Changelog</b>
          <ul>
            <li>Added a search option to the unit list.</li>
            <li>Units are now sorted by alphabetical order.</li>
            <li>Made more fields on the card truncate or have a maximum shown length.</li>
            <li>
              <b>0.3.1: </b>Removed html tags from descriptions and abilities.
            </li>
            <li>
              <b>0.3.2: </b>Added an example card to the mobile landingpage.
            </li>
            <li>
              <b>0.3.2: </b>Made all text fields optional and not prone to crash if they were non-existant.
            </li>
            <li>
              <b>0.3.3: </b>Nested weaponprofiles are now unique for all units.
            </li>
          </ul>
        </Panel>
        <Panel header={'Version 0.2.0'} key={'0.2.0'}>
          <b>Changelog</b>
          <ul>
            <li>Updated the Page menu to use an icon bar instead of text buttons.</li>
            <li>Having a "broken" card in your page will now allow you to select and delete it.</li>
            <li>The default selection of external data set cards now includes less data visible by Default.</li>
          </ul>
        </Panel>
      </Collapse>
    </div>
  );
};
