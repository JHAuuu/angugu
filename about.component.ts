import { Component, Injector, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { HttpClient } from '@angular/common/http';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import grapesjs from 'grapesjs';
import grapesjsBlocksBasic from 'grapesjs-blocks-basic';
import formsPlugin from 'grapesjs-plugin-forms';
import customCodePlugin from 'grapesjs-custom-code';
import clockCountdown from 'grapesjs-component-countdown';
import typedText from 'grapesjs-typed';
import exportPlugin from 'grapesjs-plugin-export';
import { JoditConfig } from "ngx-jodit";
import { StampTemplatesService } from './stampTemplateService';
import { UserRoleService } from '../../services/roles.service';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  animations: [appModuleAnimation()],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent extends AppComponentBase implements AfterViewInit, OnDestroy {

  isAdminUser: boolean = false;
  editor: any;
  stampEvent: any = {
    publicName: "",
    publicDescription: "",
    backgroundImageUrl: "" // Default empty
  };
  eventStartDate: Date;
  eventEndDate: Date;

  joditOptions: JoditConfig = {
    uploader: {
      insertImageAsBase64URI: true,
    } as any,
  };



  onBackgroundImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.stampEvent.backgroundImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  async updatePreviewHtml() {
    if (!this.editor) {
      console.error("Error: 'editor' is not initialized");
      return;
    }
    
    // Update components in GrapesJS model properly
    const updateElementContent = (selector, content) => {
      if (!content) return false;
      
      // Get components by CSS selector
      const components = this.editor.DomComponents.getWrapper().find(selector);
      console.log(`Found ${components.length} components for selector: ${selector}`);
      
      if (components.length) {
        components.forEach(component => {
          // Clear existing content
          component.components().reset();
          
          // Add new content as a text component
          component.append(content);
        });
        return true;
      }
      return false;
    };
    
    // Update each element type
    const nameUpdated = updateElementContent('.publicName', this.stampEvent.publicName);
    const descUpdated = updateElementContent('.publicDescription', this.stampEvent.publicDescription);
    
    // For dates, format them properly (handle possible undefined)
    let formattedStartDate = '';
    let formattedEndDate = '';
    
    if (this.eventStartDate) {
      formattedStartDate = typeof this.templateService.formatDate === 'function' 
        ? this.templateService.formatDate(this.eventStartDate)
        : new Date(this.eventStartDate).toLocaleDateString();
        console.log(formattedStartDate)
    }
    
    if (this.eventEndDate) {
      formattedEndDate = typeof this.templateService.formatDate === 'function'
        ? this.templateService.formatDate(this.eventEndDate)
        : new Date(this.eventEndDate).toLocaleDateString();
        console.log(formattedEndDate)
    }
    
   
    

    const startDateUpdated = updateElementContent('.eventStartDate', formattedStartDate);
    const endDateUpdated = updateElementContent('.eventEndDate', formattedEndDate);

      // Handle background image update
      const backgroundImageUrl = this.stampEvent.backgroundImageUrl;
      if (backgroundImageUrl) {
        // Use CssComposer to add or update styles without replacing existing ones
        const cssComposer = this.editor.CssComposer;
        
        // Create or update a rule for the body background
        const rule = cssComposer.setRule('body.gjs-dashed', {
          'background-image': `url('${backgroundImageUrl}')`,
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat'
        });
    
        // Alternatively, you can use this approach:
        this.editor.StyleManager.addProperty('bg', {
          name: 'Background Image',
          property: 'background-image',
          type: 'file',
          defaults: backgroundImageUrl
        });
      }
    
      
    
    // Log what was updated
    console.log("Update results:", {
      nameUpdated, descUpdated, startDateUpdated, endDateUpdated,
      backgroundUpdated: !!this.stampEvent.backgroundImageUrl
    });
  }


  async saveJSON() {
    try {
      await this.updatePreviewHtml();
      console.log("Canvas updated with new values:", {
        publicName: this.stampEvent.publicName,
        publicDescription: this.stampEvent.publicDescription,
        startDate: this.eventStartDate ? new Date(this.eventStartDate).toISOString() : null,
        endDate: this.eventEndDate ? new Date(this.eventEndDate).toISOString() : null,
        backgroundImage: this.stampEvent.backgroundImageUrl,
        currentHTML: this.editor.getHtml()
      });
    } catch (error) {
      console.error("Error saving template:", error);
    }
  }

//#region generate stamp template

  // Delegate to template service
  async generateDefault() {
    await this.templateService.generateDefaultTemplate(this.editor);
  }


  async generateCnyTemp() {
    await this.templateService.generateCnyTemplate(this.editor);
  }

  async generateChristTemp() {
    await this.templateService.generateChristmasTemplate(this.editor);
  }
  //#endregion

  //#region generate stamp
  async generateHariRayaStamp() {
    await this.templateService.updateHariRayaStampSection(this.editor);
  }

  // Delegate to template service
  async generateChristStamp() {
    await this.templateService.updateChristmasStampSection(this.editor);
  }

  async generateCNYStamp() {
    await this.templateService.updateCNYStampSection(this.editor);
  }
  //#endregion

//#region generate Rewards Section


// Update rewards for Hari Raya template
async updateHariRayaReward() {
  await this.templateService.updateHariRayaRewards(this.editor);
}

// Update rewards for CNY template
async updateCNYReward() {
  await this.templateService.updateCNYRewards(this.editor);
}

// Update rewards for Christmas template
async updateChristmasReward() {
  await this.templateService.updateChristmasRewards(this.editor);
}

//#endregion

  private autosaveInterval: any;

  //constructor
  constructor(
    injector: Injector, 
    private http: HttpClient,
    private templateService: StampTemplatesService,
    private userRole: UserRoleService) {
    super(injector);

  }

  checkIfUserIsAdmin(): void {
    this.userRole.isAdmin().subscribe(
      isAdmin => {
        this.isAdminUser = isAdmin;
        if (isAdmin) {
          console.log('User is an admin');
        } else {
          console.log('User is not an admin');
        }
      }
    );
  }

  ngOnInit(): void {
    this.checkIfUserIsAdmin();
    // other initialization code
  }

  ngAfterViewInit(): void {
      setTimeout(() => {

        
        const container = document.getElementById('gjs');
        if (!container) {
          console.error('GrapesJS container not found!');
          return;
        }
  
  
    this.editor = grapesjs.init({
  
  
      storageManager: false, // Disable default storage,  

      canvas: {
        scripts: ["https://cdn.tailwindcss.com"]
      },
      container: '#gjs',
      fromElement: true,
      height: '500px',
      width: 'auto',

      panels: {
        defaults: [
          {
            id: 'layers',
            el: '.panel__right',
            // Make the panel resizable
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: false, // Top handler
              cl: true, // Left handler
              cr: false, // Right handler
              bc: false, // Bottom handler
              // Being a flex child we need to change `flex-basis` property
              // instead of the `width` (default)
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fas fa-laptop"></i>', // FontAwesome Layers Icon

                command: 'set-device-desktop',
                active: true,
                togglable: false,
              }, {
                id: 'device-tablet',
                label: '<i class="fas fa-tablet"></i>', // FontAwesome Layers Icon
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<i class="fas fa-mobile"></i>', // FontAwesome Layers Icon
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
          {
            id: 'panel-switcher',
            el: '.panel__switcher',
            buttons: [

              {

                id: 'show-layers',
                active: true,
                label: '<i class="fas fa-layer-group"></i>', // FontAwesome Layers Icon
                command: 'show-layers',
                // Once activated disable the possibility to turn it off
                togglable: false,
              },
              {
                id: 'show-style',
                active: true,
                label: '<i class="fas fa-palette"></i>', // FontAwesome Layers Icon
                command: 'show-styles',
                togglable: false,
              },
              {
                id: 'show-traits',
                active: true,
                label: '<i class="fas fa-cog"></i>', // FontAwesome Layers Icon
                command: 'show-traits',
                togglable: false,
              },
              {
                id: 'show-blocks',
                active: true,
                label: '<i class="fas fa-plus"></i>', // FontAwesome Layers Icon
                command: 'show-blocks',
                togglable: false,
              },
            ],
          },





        ],

      },



      selectorManager: {
        appendTo: '.styles-container',
      },

      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'General',
            open: !1,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
          },

          {
            name: 'Dimension',
            open: !1,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: !1,
            buildProps: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
              'text-shadow',
            ], properties: [
              {
                property: 'text-align',
                list: [
                  { id: "left", value: 'left', className: 'fa fa-align-left' },
                  { id: "center", value: 'center', className: 'fa fa-align-center' },
                  { id: "right", value: 'right', className: 'fa fa-align-right' },
                  { id: "justify", value: 'justify', className: 'fa fa-align-justify' },
                ],
              },
            ],
          },
          {
            name: 'Decorations',
            open: !1,
            buildProps: [
              'border-radius-c',
              'background-color',
              'border-radius',
              'border',
              'box-shadow',
              'background',
            ],
          },
          { name: 'Extra', open: !1, buildProps: ['transition', 'perspective', 'transform'] },
        ],
      },
      layerManager: {
        appendTo: '.layers-container',
      },
      traitManager: {
        appendTo: '.traits-container',
      }, deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '', // default size
          },
          {
            name: 'Tablet',
            width: '768px', // Default size for tablets
            widthMedia: '1024px', // Media query breakpoint
          },
          {
            name: 'Mobile',
            width: '320px', // this value will be used on canvas width
            widthMedia: '480px', // this value will be used in CSS @media
          },
        ],
      },
      blockManager: {
        appendTo: '.blocks-container', // Make sure this exists
      },
      plugins: [grapesjsBlocksBasic, formsPlugin, customCodePlugin, clockCountdown, exportPlugin],
      pluginsOpts: {
        grapesjsBlocksBasic: {},
        formsPlugin: {},
        customCodePlugin: {},   // Custom Code block for embedding scripts
        clockCountdown: {},
        exportPlugin: {}
      }
    });

  
  
  
        this.addCustomComponents();
        this.addCustomStamp();
        this.addCustomReward();
        // ✅ Add Undo/Redo Buttons to Panels
        this.editor.Panels.addPanel({
          id: 'undo-redo-panel',
          el: '.panel__switcher',
          buttons: [
            {
              id: 'dlt',
              className: 'btn-dlt',
              label: '<i class="fas fa-trash"></i>', // FontAwesome Trash Icon
              command: () => {
                // Show confirmation dialog
                if (confirm('Are you sure you want to delete all content? ')) {
                  // If confirmed, execute the clear command
                  this.editor.runCommand('core:canvas-clear');
                }
              },
            },
            {
              id: 'fullscreen',
              className: 'btn-fullscreen',
              label: '<i class="fas fa-expand"></i>', // FontAwesome Full-Screen Icon
              command: 'core:fullscreen',
            },
            {
              id: 'preview',
              className: 'btn-preview',
              label: '<i class="fas fa-eye"></i>', // FontAwesome Redo Icon
              command: 'core:preview',
            },
            {
              id: 'undo',
              className: 'btn-undo',
              label: '<i class="fas fa-undo"></i>', // FontAwesome Undo Icon
              command: 'core:undo',
            },
            {
              id: 'redo',
              className: 'btn-redo',
              label: '<i class="fas fa-redo"></i>', // FontAwesome Redo Icon
              command: 'core:redo',
            }
          ],
        });
  
  
        this.editor.Commands.add('preview', {
          run(editor) {
            try {
              if (!editor.Commands.isActive('preview')) {
                editor.runCommand('core:preview');
              }
            } catch (error) {
              console.error('Error running preview command:', error);
              alert('An error occurred: ' + error.message);
            }
          },
          stop(editor) {
            try {
              editor.stopCommand('core:preview');
            } catch (error) {
              console.error('Error stopping preview command:', error);
              alert('An error occurred: ' + error.message);
            }
          }
        });
  
  
        this.editor.Commands.add('fullscreen', {
          run(editor) {
            const wrapper = document.documentElement;
  
            if (!document.fullscreenElement) {
              if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen();
              }
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              }
            }
          }
        });
  
  
        // Commands
        this.editor.Commands.add('set-device-desktop', {
          run: (editor) => editor.setDevice('Desktop'),
        });
  
        this.editor.Commands.add('set-device-tablet', {
          run: (editor) => editor.setDevice('Tablet'),
        });
  
        this.editor.Commands.add('set-device-mobile', {
          run: (editor) => editor.setDevice('Mobile'),
        });
        this.editor.Commands.add('show-traits', {
          getTraitsEl(editor) {
            const row = editor.getContainer().closest('.editor-row');
            return row.querySelector('.traits-container');
          },
          run(editor, sender) {
            this.getTraitsEl(editor).style.display = '';
          },
          stop(editor, sender) {
            this.getTraitsEl(editor).style.display = 'none';
          },
        });
  
        // Define commands
        // ✅ Add Undo/Redo Commands
        this.editor.Commands.add('undo', {
          run: (editor) => editor.UndoManager.undo(),
        });
  
        this.editor.Commands.add('redo', {
          run: (editor) => editor.UndoManager.redo(),
        });
  
  
        this.editor.Commands.add('show-layers', {
          getRowEl(editor) {
            return editor.getContainer().closest('.editor-row');
          },
          getLayersEl(row) {
            return row.querySelector('.layers-container');
          },
  
          run(editor, sender) {
            const lmEl = this.getLayersEl(this.getRowEl(editor));
            lmEl.style.display = '';
          },
          stop(editor, sender) {
            const lmEl = this.getLayersEl(this.getRowEl(editor));
            lmEl.style.display = 'none';
          },
        });
        this.editor.Commands.add('show-styles', {
          getRowEl(editor) {
            return editor.getContainer().closest('.editor-row');
          },
          getStyleEl(row) {
            return row.querySelector('.styles-container');
          },
  
          run(editor, sender) {
            const smEl = this.getStyleEl(this.getRowEl(editor));
            smEl.style.display = '';
          },
          stop(editor, sender) {
            const smEl = this.getStyleEl(this.getRowEl(editor));
            smEl.style.display = 'none';
          },
        });
  
        this.editor.Commands.add('show-blocks', {
          getRowEl(editor) {
            return editor.getContainer().closest('.editor-row');
          },
          getBlockEl(row) {
            return row.querySelector('.blocks-container');
          },
  
          run(editor, sender) {
            const bmEl = this.getBlockEl(this.getRowEl(editor));
            bmEl.style.display = '';
          },
          stop(editor, sender) {
            const bmEl = this.getBlockEl(this.getRowEl(editor));
            bmEl.style.display = 'none';
          },
        });
  
        // ✅ Move this inside ngAfterViewInit() after initializing editor
        this.editor.Panels.addPanel({
          id: 'panel-top',
          el: '.panel__top',
        });

        if(this.isAdminUser){
          this.editor.Panels.addPanel({
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              //visibility
              {
                id: 'visibility',
                active: true, // active by default
                className: 'btn-toggle-borders',
                label: '<i class="fas fa-table"></i>', // FontAwesome Layers Icon
                command: 'sw-visibility', // Built-in command
              },
              //export
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fas fa-file-code"></i>', // FontAwesome Layers Icon
                command: 'export-template',
                context: 'export-template', // For grouping context of buttons from the same panel
              },
              //import
              {
                id: 'import',
                className: 'btn-open-import',
                label: '<i class="fas fa-upload"></i>',
                command: 'import-template',
              },
              //show json
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fas fa-terminal"></i>', // FontAwesome Layers Icon
    
                context: 'show-json',
                command: (editor) => {
                  const componentsJson = JSON.stringify(editor.getComponents());
                  const stylesJson = JSON.stringify(editor.CssComposer.getAll().toJSON());  // Get styles as an array of objects
    
                  editor.Modal.setTitle('Components JSON')
                    .setContent(
                      `<textarea style="width:100%; height: 250px;">
                      {
                        "components": ${componentsJson},
                        "styles": ${stylesJson}
                      }
                      </textarea>`,
                    )
                    .open();
                },
    
              },
    
            ],
          });
        }else{
          this.editor.Panels.addPanel({
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              //visibility
              {
                id: 'visibility',
                active: true, // active by default
                className: 'btn-toggle-borders',
                label: '<i class="fas fa-table"></i>', // FontAwesome Layers Icon
                command: 'sw-visibility', // Built-in command
              },
              //export
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fas fa-file-code"></i>', // FontAwesome Layers Icon
                command: 'export-template',
                context: 'export-template', // For grouping context of buttons from the same panel
              },
              //show json
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fas fa-terminal"></i>', // FontAwesome Layers Icon
    
                context: 'show-json',
                command: (editor) => {
                  const componentsJson = JSON.stringify(editor.getComponents());
                  const stylesJson = JSON.stringify(editor.CssComposer.getAll().toJSON());  // Get styles as an array of objects
    
                  editor.Modal.setTitle('Components JSON')
                    .setContent(
                      `<textarea style="width:100%; height: 250px;">
                      {
                        "components": ${componentsJson},
                        "styles": ${stylesJson}
                      }
                      </textarea>`,
                    )
                    .open();
                },
    
              },
    
            ],
          });
        }
        

        this.loadContent();
        this.startAutosave();
        // Load JSON File Dynamically
  
  
  
  
  
  
  
  
        // Load JSON and Generate Page
        const canvasElement = document.querySelector('.gjs-cv-canvas.gjs-no-touch-actions.gjs-cv-canvas-bg') as HTMLElement;
  
        if (canvasElement) {
          canvasElement.style.width = '100%'; // Set the width dynamically
          canvasElement.style.marginTop = '-36px'
        }
  
      }, 0);
  

  


    setTimeout(() => {
      this.editor.Commands.add("import-template", {
        run: (editor, sender) => {
          sender?.set("active", false); // Deselect button after clicking

          const modal = editor.Modal;
          modal.setTitle("Import Template");

          const container = document.createElement("div");

          // Get the current HTML and CSS from the editor
          const currentHtml = editor.getHtml(); // Retrieves current HTML
          const currentCss = editor.getCss(); // Retrieves current CSS
          const combinedContent = `<style>${currentCss}</style>\n${currentHtml}`; // Combine both

          container.innerHTML = `
            <div style="padding: 20px;">
              <div style="margin-bottom: 15px;">
                <p style="color: #555; margin-bottom: 10px;">Paste your HTML/CSS code below:</p>
                <textarea id="import-area" style="width: 100%; height: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 14px;">${combinedContent}</textarea>
              </div>
              <div style="display: flex; justify-content: flex-end;">
                <button id="import-cancel-btn" style="margin-right: 10px; padding: 8px 15px; background: #e6e6e6; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
                <button id="import-btn" style="padding: 8px 15px; background: #4a6cf7; color: white; border: none; border-radius: 3px; cursor: pointer;">Import</button>
              </div>
            </div>
          `;

          modal.setContent(container);
          modal.open();

          // Import button click handler
          document.getElementById("import-btn")?.addEventListener("click", () => {
            const htmlContent = (document.getElementById("import-area") as HTMLTextAreaElement).value;
            if (htmlContent) {
              editor.setComponents(htmlContent); // Set components dynamically
            }
            modal.close();
          });

          // Cancel button click handler
          document.getElementById("import-cancel-btn")?.addEventListener("click", () => {
            modal.close();
          });
        },
      });
    }, 100); // ✅ Ensures it's inside setTimeout()





  }



  addCustomComponents() {
    const bm = this.editor.BlockManager;

    // Ensure we use the same "Extra" category
    const extraCategory = 'Extra';

    // Add Countdown Component
    bm.add('countdown', {
      label: 'Countdown',
      category: extraCategory,  // Use the same category
      content: { type: 'countdown' }
    });
    bm.add('sample', {
      label: 'Sample',
      category: extraCategory,
      content: `<div class="sample-component"></div>`,
    });
    bm.add('cnySample', {
      label: 'cnySample',
      category: extraCategory,
      content: `<div class="cnyTemplate-component"></div>`,
    });
    bm.add('christSample', {
      label: 'chirstmast sample',
      category: extraCategory,
      content: `<div class="chrisTemplate-component"></div>`,
    });

    // ✅ Listen for when any component is added to the editor
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('sample-component')) {
        console.log("Sample block dropped into editor!");
        this.generateDefault(); // ✅ Call loadJSON() when dragged & dropped
      }
    });
    // ✅ Listen for when any component is added to the editor
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('cnyTemplate-component')) {
        console.log("Sample block dropped into editor!");
        this.generateCnyTemp(); // ✅ Call loadJSON() when dragged & dropped
      }
    });

        // ✅ Listen for when any component is added to the editor
        this.editor.on('component:add', (component) => {
          if (component.get('tagName') === 'div' && component.getClasses().includes('chrisTemplate-component')) {
            console.log("Sample block dropped into editor!");
            this.generateChristTemp(); // ✅ Call loadJSON() when dragged & dropped
          }
        });
  }

  addCustomStamp() {
    const bms = this.editor.BlockManager;

    // Ensure we use the same "Extra" category
    const extraCategory = 'Custom Stamp';

    bms.add('hr', {
      label: 'Hari Raya Stamp',
      category: extraCategory,
      content: `<div class="hariRayaStamp-component"></div>`,
    });

    bms.add('cs', {
      label: 'Christmas Stamp',
      category: extraCategory,
      content: `<div class="Christmas-component"></div>`,
    });
    bms.add('cy', {
      label: 'CNY Stamp',
      category: extraCategory,
      content: `<div class="CNY-component"></div>`,
    });


    // ✅ Listen for when any component is added to the editor
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('hariRayaStamp-component')) {
        console.log("Sample block dropped into editor!");
        this.generateHariRayaStamp(); // ✅ Call loadJSON() when dragged & dropped
      }
    });
    // ✅ Listen for when any component is added to the editor
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('Christmas-component')) {
        console.log("Sample block dropped into editor!");
        this.generateChristStamp(); // ✅ Call loadJSON() when dragged & dropped
      }
    });
    // ✅ Listen for when any component is added to the editor
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('CNY-component')) {
        console.log("Sample block dropped into editor!");
        this.generateCNYStamp(); // ✅ Call loadJSON() when dragged & dropped
      }
    });

  }

  addCustomReward() {
    const bms = this.editor.BlockManager;
  
    // Use a category for reward blocks
    const rewardCategory = 'Reward Blocks';
  
    // Add reward blocks for each template
    bms.add('hr-reward', {
      label: 'Hari Raya Reward',
      category: rewardCategory,
      content: `<div class="hariRayaReward-component"></div>`,
    });
  
    bms.add('cs-reward', {
      label: 'Christmas Reward',
      category: rewardCategory,
      content: `<div class="christmasReward-component"></div>`,
    });
    
    bms.add('cny-reward', {
      label: 'CNY Reward',
      category: rewardCategory,
      content: `<div class="cnyReward-component"></div>`,
    });
  
    // Add event listeners for reward components
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('hariRayaReward-component')) {
        console.log("Hari Raya Reward block dropped into editor!");
        this.updateHariRayaReward();
      }
    });
  
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('christmasReward-component')) {
        console.log("Christmas Reward block dropped into editor!");
        this.updateChristmasReward();
      }
    });
  
    this.editor.on('component:add', (component) => {
      if (component.get('tagName') === 'div' && component.getClasses().includes('cnyReward-component')) {
        console.log("CNY Reward block dropped into editor!");
        this.updateCNYReward();
      }
    });
  }



  private saveContent(): void {
    const content = this.editor.getHtml(); // Get HTML content
    const styles = this.editor.getCss(); // Get CSS as a string

    const payload = {
      content: content, // HTML content
      styles: styles // CSS styles
    };

    this.http.post('https://localhost:44311/api/grapesjs/store', payload)
      .subscribe(
        () => console.log('Autosaved successfully at', new Date().toLocaleTimeString()),
        (error) => {
          if (error.status === 401) {
            // Handle unauthorized error (maybe redirect to login)
            this.notify.error('Please log in to save your content');
          } else {
            console.error('Autosave failed:', error);
          }
        }
      );
  }


  private startAutosave(): void {
    // Save content when components update
    this.editor.on('component:update', () => {
      this.saveContent();
    });

    // Autosave every 30 seconds
    this.autosaveInterval = setInterval(() => {
      this.saveContent();
    }, 3000);
  }
  private loadContent(): void {
    this.http.get<{ result: { content: string, styles: string } }>('https://localhost:44311/api/grapesjs/load').subscribe(
        (data) => {
          if (data?.result?.content) {
            this.editor.setComponents(data.result.content); // Set HTML directly
          } else {
            console.warn('No content received, loading default content.');
            this.editor.setComponents('<div>Default Content</div>');
          }

          if (data?.result?.styles) {
            this.editor.setStyle(data.result.styles); // Set CSS styles
          } else {
            console.warn('No styles received, applying default styles.');
            this.editor.setStyle('');
          }
        },
        (error) => {
          if (error.status === 401) {
            // Handle unauthorized error (maybe redirect to login)
            this.notify.error('Please log in to load your content');
          } else {
            console.error('Failed to load content:', error);
          }
        }
      );
  }


  // Function to Convert JSON to HTML
  private jsonToHtml(components: any[]): string {
    return components
      .map((component) => {
        if (component.type === 'textnode') {
          return component.content; // Directly return text content
        }

        let tag = component.tagName || 'div'; // Default to <div> if tagName is missing
        let innerHTML = component.components ? this.jsonToHtml(component.components) : '';

        return `<${tag}>${innerHTML}</${tag}>`;
      })
      .join('');
  }

  


  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }
}

 