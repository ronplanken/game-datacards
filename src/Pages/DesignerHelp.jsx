import React, { useState, useEffect, useRef } from "react";
import { Typography, Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUmami } from "../Hooks/useUmami";
import { AppHeader } from "../Components/AppHeader";
import "./DesignerHelp.css";

const { Title, Paragraph, Text } = Typography;
const { Sider, Content } = Layout;

const sections = [
  { key: "getting-started", label: "Getting Started" },
  { key: "creating-a-template", label: "Creating a Template" },
  { key: "the-workspace", label: "The Workspace" },
  { key: "elements", label: "Elements" },
  { key: "layers-and-depth", label: "Layers and Depth" },
  { key: "frames-and-auto-layout", label: "Frames and Auto-Layout" },
  { key: "data-binding", label: "Data Binding" },
  { key: "repeater-frames", label: "Repeater Frames" },
  { key: "grid-and-alignment", label: "Grid and Alignment" },
  { key: "keyboard-shortcuts", label: "Keyboard Shortcuts" },
  { key: "saving-and-managing", label: "Saving and Managing" },
  { key: "template-presets", label: "Template Presets" },
];

export const DesignerHelp = () => {
  const navigate = useNavigate();
  const { trackEvent } = useUmami();
  const [activeKey, setActiveKey] = useState("getting-started");
  const contentRef = useRef(null);

  useEffect(() => {
    trackEvent("designer-help-view", {});
  }, [trackEvent]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sectionEls = container.querySelectorAll("[data-section]");
      let current = "getting-started";
      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top - containerRect.top <= 80) {
          current = el.getAttribute("data-section");
        }
      }
      setActiveKey(current);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (key) => {
    const el = contentRef.current?.querySelector(`[data-section="${key}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const mod = isMac ? "Cmd" : "Ctrl";

  return (
    <>
      <AppHeader showActions={false} pageTitle="Designer Help" />
      <Layout className="designer-help-layout">
        <Sider className="designer-help-sider" width={260}>
          <div className="designer-help-sider-header">
            <button className="designer-help-back-btn" onClick={() => navigate("/designer")}>
              <ArrowLeft size={16} />
              Back to Designer
            </button>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={sections.map((s) => ({ key: s.key, label: s.label }))}
            onClick={({ key }) => scrollToSection(key)}
            className="designer-help-menu"
          />
        </Sider>
        <Content className="designer-help-content" ref={contentRef}>
          <div className="designer-help-content-inner">
            {/* Getting Started */}
            <section data-section="getting-started">
              <Typography>
                <Title level={2}>Getting Started</Title>
                <Paragraph>
                  The Card Designer lets you build custom datacard templates for your armies. Design your own card
                  layouts from scratch or start from a preset. Add text, images, shapes, and frames, then connect your
                  designs to real game data so your cards update automatically when unit stats change.
                </Paragraph>
                <Paragraph>
                  The Designer is currently in beta. Features may change between updates, and templates you create now
                  may need adjustments in future versions.
                </Paragraph>
              </Typography>
            </section>

            {/* Creating a Template */}
            <section data-section="creating-a-template">
              <Typography>
                <Title level={2}>Creating a Template</Title>
                <Paragraph>
                  {'To create a new template, click "New Template" in the layer panel. You\'ll choose three things:'}
                </Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>A starting size</Text> — Pick a preset that matches your card type, or set custom
                    dimensions.
                  </li>
                  <li>
                    <Text strong>A target format</Text> — Choose whether this template is for Warhammer 40K or Age of
                    Sigmar. This determines which data fields are available for binding.
                  </li>
                  <li>
                    <Text strong>A name</Text> — Give your template a name so you can find it later.
                  </li>
                </ul>
              </Typography>
            </section>

            {/* The Workspace */}
            <section data-section="the-workspace">
              <Typography>
                <Title level={2}>The Workspace</Title>
                <Paragraph>The Designer workspace is split into four areas.</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Layer Panel</Text> (left side) — Shows all your elements in a tree view. Manage
                    templates, reorder layers, and organize elements into frames. Elements at the top of the list appear
                    in front on the canvas.
                  </li>
                  <li>
                    <Text strong>Canvas</Text> (center) — Your main editing area. Click, drag, and resize elements
                    directly. What you see here is what your card will look like.
                  </li>
                  <li>
                    <Text strong>Floating Toolbar</Text> (above the canvas) — Quick access buttons for adding elements
                    and controlling zoom level.
                  </li>
                  <li>
                    <Text strong>Properties Panel</Text> (right side) — Shows settings for whatever you have selected.
                    Change colors, fonts, sizes, positions, and more. When nothing is selected, it shows canvas settings
                    like background color and dimensions.
                  </li>
                </ul>
              </Typography>
            </section>

            {/* Elements */}
            <section data-section="elements">
              <Typography>
                <Title level={2}>Elements</Title>
                <Paragraph>Elements are the building blocks of your template.</Paragraph>

                <Title level={4}>Text</Title>
                <Paragraph>
                  Add headings, labels, stat values, or any other text. You can customize the font (choose from 10 font
                  families including Helvetica, Arial, and Georgia), size, weight, style, color, and alignment. Adjust
                  line height and the space between characters for fine-tuned control.
                </Paragraph>

                <Title level={4}>Images</Title>
                <Paragraph>
                  Add artwork, icons, faction logos, or decorative elements. Upload an image file or place a placeholder
                  to fill in later. Adjust scaling and opacity to get the look you want.
                </Paragraph>

                <Title level={4}>Shapes</Title>
                <Paragraph>Add visual structure with basic shapes:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Rectangles</Text> — Set fill color, border, and rounded corners
                  </li>
                  <li>
                    <Text strong>Circles</Text> — Set fill color and border
                  </li>
                  <li>
                    <Text strong>Lines</Text> — Set color and thickness
                  </li>
                </ul>

                <Title level={4}>Frames</Title>
                <Paragraph>
                  Frames are special container elements that group other elements together. They are the key to building
                  structured layouts. See the Frames and Auto-Layout section for details.
                </Paragraph>
              </Typography>
            </section>

            {/* Layers and Depth */}
            <section data-section="layers-and-depth">
              <Typography>
                <Title level={2}>Layers and Depth</Title>
                <Paragraph>The layer order controls which elements appear in front of others.</Paragraph>
                <Paragraph>
                  Elements at the top of the layer panel sit in front on the canvas. Elements at the bottom sit behind
                  everything else. Think of it like a stack of transparent sheets — the top sheet covers everything
                  below it.
                </Paragraph>
                <Paragraph>To change the order:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Drag layers</Text> up or down in the layer panel
                  </li>
                  <li>
                    <Text strong>Keyboard</Text> — Press {mod}+] to bring an element to the front, or {mod}+[ to send it
                    to the back
                  </li>
                  <li>
                    <Text strong>Right-click</Text> any element on the canvas and choose {'"Bring to Front"'} or
                    {' "Send to Back"'}
                  </li>
                </ul>
                <Paragraph>
                  Elements inside a frame are layered relative to each other within that frame. Moving a frame moves all
                  its children together.
                </Paragraph>
              </Typography>
            </section>

            {/* Frames and Auto-Layout */}
            <section data-section="frames-and-auto-layout">
              <Typography>
                <Title level={2}>Frames and Auto-Layout</Title>
                <Paragraph>Frames act as containers that hold and organize other elements.</Paragraph>
                <Paragraph>
                  Drag elements into a frame to group them. The frame can then control how its children are arranged.
                </Paragraph>

                <Title level={4}>Auto-layout modes</Title>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>None</Text> — Children are positioned freely, just like on the main canvas
                  </li>
                  <li>
                    <Text strong>Horizontal</Text> — Children are arranged in a row, left to right
                  </li>
                  <li>
                    <Text strong>Vertical</Text> — Children are stacked in a column, top to bottom
                  </li>
                </ul>

                <Title level={4}>Layout settings</Title>
                <Paragraph>When auto-layout is active, you can adjust:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Gap</Text> — The space between each child element
                  </li>
                  <li>
                    <Text strong>Padding</Text> — The space between the frame edge and its contents
                  </li>
                  <li>
                    <Text strong>Alignment</Text> — Where children sit along the cross-axis (start, center, or end)
                  </li>
                </ul>

                <Title level={4}>Clipping</Title>
                <Paragraph>
                  {
                    'Enable "Clip content" to hide anything that extends beyond the frame boundaries. This keeps your layout tidy when elements are larger than the available space.'
                  }
                </Paragraph>
              </Typography>
            </section>

            {/* Data Binding */}
            <section data-section="data-binding">
              <Typography>
                <Title level={2}>Data Binding</Title>
                <Paragraph>Connect your template to real game data so cards fill in automatically.</Paragraph>
                <Paragraph>Wrap any field name in double curly braces inside a text element. For example:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <code className="designer-help-code">{"{{name}}"}</code> — Shows the unit name
                  </li>
                  <li>
                    <code className="designer-help-code">{"{{stats.wounds}}"}</code> — Shows the wounds stat
                  </li>
                </ul>
                <Paragraph>
                  Toggle preview mode in the toolbar to see your template populated with actual unit data. This helps
                  you check that everything fits and looks right before you finalize your design.
                </Paragraph>
                <Paragraph>
                  Data binding works with both Warhammer 40K and Age of Sigmar data. The available fields depend on
                  which target format you chose when creating the template.
                </Paragraph>
              </Typography>
            </section>

            {/* Repeater Frames */}
            <section data-section="repeater-frames">
              <Typography>
                <Title level={2}>Repeater Frames</Title>
                <Paragraph>Use repeater frames to display lists of items, like weapons or abilities.</Paragraph>
                <Paragraph>
                  A repeater frame takes an array of data (for example, a list of ranged weapons) and creates a copy of
                  its contents for each item.
                </Paragraph>
                <Paragraph>To set up a repeater:</Paragraph>
                <ol className="designer-help-list designer-help-list-numbered">
                  <li>Create a frame and add the elements you want repeated (one row of content)</li>
                  <li>{'Enable "Repeat" mode in the frame properties'}</li>
                  <li>
                    Set the <Text strong>data source</Text> — the array path to repeat over (e.g.,{" "}
                    <code className="designer-help-code">rangedWeapons</code>)
                  </li>
                  <li>
                    Choose a <Text strong>direction</Text> — stack copies vertically or horizontally
                  </li>
                  <li>
                    Optionally set a <Text strong>maximum count</Text> to limit how many items are shown
                  </li>
                </ol>
                <Paragraph>Switch to preview mode to see the repeater in action with real unit data.</Paragraph>
              </Typography>
            </section>

            {/* Grid and Alignment */}
            <section data-section="grid-and-alignment">
              <Typography>
                <Title level={2}>Grid and Alignment</Title>
                <Paragraph>The grid helps you place elements precisely.</Paragraph>
                <Paragraph>
                  A 10-pixel grid is shown by default. Elements snap to the nearest grid line as you move or resize
                  them, making it easy to keep things aligned.
                </Paragraph>
                <Paragraph>You can:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Change the grid size</Text> in the canvas properties
                  </li>
                  <li>
                    <Text strong>Toggle grid visibility</Text> on or off
                  </li>
                  <li>
                    <Text strong>Disable snapping</Text> when you need freeform placement
                  </li>
                </ul>

                <Title level={4}>Alignment tools</Title>
                <Paragraph>Select an element and use the alignment buttons in the properties panel:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Align left, right, top, or bottom</Text> — Snap to the canvas edge
                  </li>
                  <li>
                    <Text strong>Center horizontally or vertically</Text> — Place at the exact center of the canvas
                  </li>
                </ul>
              </Typography>
            </section>

            {/* Keyboard Shortcuts */}
            <section data-section="keyboard-shortcuts">
              <Typography>
                <Title level={2}>Keyboard Shortcuts</Title>
                <div className="designer-help-shortcuts-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Shortcut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Delete selected elements</td>
                        <td>
                          <kbd>Delete</kbd> or <kbd>Backspace</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Copy</td>
                        <td>
                          <kbd>{mod}+C</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Paste</td>
                        <td>
                          <kbd>{mod}+V</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Select all</td>
                        <td>
                          <kbd>{mod}+A</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Move by 1 pixel</td>
                        <td>
                          <kbd>Arrow keys</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Move by 10 pixels</td>
                        <td>
                          <kbd>Shift</kbd> + <kbd>Arrow keys</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Bring to front</td>
                        <td>
                          <kbd>{mod}+]</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>Send to back</td>
                        <td>
                          <kbd>{mod}+[</kbd>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Paragraph>
                  Pasted elements are offset by a few pixels from the original, so you can see both copies.
                </Paragraph>
              </Typography>
            </section>

            {/* Saving and Managing */}
            <section data-section="saving-and-managing">
              <Typography>
                <Title level={2}>Saving and Managing Templates</Title>
                <Paragraph>Your work saves automatically.</Paragraph>
                <Paragraph>
                  {
                    "Every change you make is saved to your browser within about a second. You'll see a status indicator showing whether your template is saved, saving, or has unsaved changes."
                  }
                </Paragraph>

                <Title level={4}>Export and import</Title>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Export</Text> a template as a JSON file to back it up or share it with others
                  </li>
                  <li>
                    <Text strong>Import</Text> a JSON file to load a template someone else created
                  </li>
                </ul>

                <Title level={4}>Duplicate</Title>
                <Paragraph>
                  {
                    'Create a copy of any template to experiment without affecting the original. Duplicates are named with "(Copy)" appended.'
                  }
                </Paragraph>

                <Title level={4}>Important</Title>
                <Paragraph>
                  {
                    "Templates are stored in your browser's local storage. Clearing your browser data will remove them. Use export to keep backups of templates you want to keep."
                  }
                </Paragraph>
              </Typography>
            </section>

            {/* Template Presets */}
            <section data-section="template-presets">
              <Typography>
                <Title level={2}>Template Presets</Title>
                <Paragraph>Presets give you a head start with common card sizes.</Paragraph>
                <div className="designer-help-shortcuts-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Preset</th>
                        <th>Dimensions</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>40K Datacard</td>
                        <td>500 x 700 px</td>
                        <td>A blank canvas at the standard Warhammer 40K datacard size.</td>
                      </tr>
                      <tr>
                        <td>40K Datacard (Styled)</td>
                        <td>500 x 700 px</td>
                        <td>Comes with a pre-built layout including text fields and faction color areas.</td>
                      </tr>
                      <tr>
                        <td>40K Stratagem</td>
                        <td>500 x 350 px</td>
                        <td>Sized for stratagem cards. Shorter and wider than a standard datacard.</td>
                      </tr>
                      <tr>
                        <td>AoS Warscroll</td>
                        <td>500 x 700 px</td>
                        <td>Sized for Age of Sigmar warscroll cards.</td>
                      </tr>
                      <tr>
                        <td>Custom</td>
                        <td>Your choice</td>
                        <td>Set any width and height between 100 and 2000 pixels.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Typography>
            </section>
          </div>
        </Content>
      </Layout>
    </>
  );
};
