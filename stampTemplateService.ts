import { Injectable } from '@angular/core';

// Define template interfaces
interface StampTemplate {
  id: string;
  name: string;
  backgroundImage: string;
  cardStyle: {
    background: string;
    borderColor: string;
    boxShadow: string;
  };
  stampStyle: {
    activeBackground: string;
    activeBorder?: string;
    inactiveBorder: string;
    inactiveColor: string;
  };
  rewardStyle?: {
    background: string;
    borderColor: string;
    activeColor: string;      // For granted rewards
    inactiveColor: string;    // For pending rewards
    activeBadge: string;      // Background for the badge of granted rewards
    inactiveBadge: string;    // Background for the badge of pending rewards
    grantedIcon: string;     // Custom emoji for granted rewards
    pendingIcon: string;     // Custom emoji for pending rewards
    dotStyle?: string;
  };
  icons: {
    stamp: string;
    decoration?: {
      src: string;
      className: string;
      style?: string;
    };
  };
  additionalCSS?: string;
}

interface CardData {
  cardID: string;
  desc: string;
  totalSpend: number;
  eventID: string;
  eventMinSpend: number;
  stampCollected: string[];
  publicName: string;
  startDate: string;
  endDate: string;
  rewards?: {
    description: string;      // Description like "RM 5 E-Voucher"
    requiredStamps: number;   // Number of stamps required
    granted: boolean;         // Whether the reward is granted
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class StampTemplatesService {
  // Available templates
  private templates: StampTemplate[] = [
    {
      id: 'hariraya',
      name: 'Hari Raya Stamp',
      backgroundImage: '/assets/hariraya.jpg',
      cardStyle: {
        background: 'lightgreen',
        borderColor: 'rgb(4, 85, 30)',
        boxShadow: '0px 4px 8px rgba(77, 240, 44, 0.94)',
      },
      stampStyle: {
        activeBackground: '#4CAF50',
        inactiveBorder: '2px dashed #999',
        inactiveColor: '#999',
      },
      rewardStyle: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgb(4, 85, 30)',
        activeColor: '#4CAF50',
        inactiveColor: '#999',
        activeBadge: '#ff4444',
        inactiveBadge: '#999999',
        grantedIcon: '/assets/hariraya.gif',  // Replace with your image URL
        pendingIcon: '/assets/reward-pending.gif',  // Replace with your image URL
        dotStyle: 'border-radius: 50%; background: linear-gradient(45deg, #4CAF50, #45a049);'
      },
      icons: {
        stamp: '/assets/hariraya.gif',
      },
    },
    {
      id: 'cny',
      name: '🎊 Chinese New Year Stamp 🎊',
      backgroundImage: '/assets/cny-background.jpg',
      cardStyle: {
        background: '#a30000',
        borderColor: 'gold',
        boxShadow: '0px 4px 8px rgba(255, 215, 0, 0.9)',
      },
      stampStyle: {
        activeBackground: 'red',
        activeBorder: '2px solid gold',
        inactiveBorder: '2px dashed gold',
        inactiveColor: 'gold',
      },
      icons: {
        stamp: '/assets/cny.gif',
        decoration: {
          src: '/assets/firecracker.gif',
          className: 'firecracker',
          style: 'position:absolute;top:15px',
        },
      },
      rewardStyle: {
        background: 'rgba(255, 215, 0, 0.2)',
        borderColor: 'gold',
        activeColor: 'red',
        inactiveColor: 'gold',
        activeBadge: 'red',
        inactiveBadge: '#a30000',
        grantedIcon: '/assets/firecracker.gif',     // Replace with your image URL
        pendingIcon: '/assets/cny.gif',       // Lock for pending
        dotStyle: 'border-radius: 0; transform: rotate(45deg); background: linear-gradient(45deg, #a30000, #ff0000);'
      },
      additionalCSS: `
        .firecracker {
          width: 80px;
          margin-top: 10px;
          animation: bounce 1.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .stamp.active {
          box-shadow: 0px 0px 10px rgba(255, 0, 0, 0.7);
        }
      `,
    },
    {
      id: 'christmas',
      name: '🎄 Merry Christmas Stamp 🎄',
      backgroundImage: '/assets/chrismas.gif',
      cardStyle: {
        background: 'rgba(0, 100, 0, 0.85)',
        borderColor: 'red',
        boxShadow: '0px 4px 12px rgba(255, 0, 0, 0.6)',
      },
      stampStyle: {
        activeBackground: '#cc0000',
        activeBorder: '2px solid #ff9999',
        inactiveBorder: '2px dashed #ffcccb',
        inactiveColor: '#ffcccb',
      },
      icons: {
        stamp: '/assets/christmasTree.png',
        decoration: {
          src: '/assets/snowflake.gif',
          className: 'snowflake',
        },
      },
      rewardStyle: {
        background: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'red',
        activeColor: '#cc0000',
        inactiveColor: '#ffcccb',
        activeBadge: 'red',
        inactiveBadge: '#006400',
        grantedIcon: '/assets/christmasTree.png', // Replace with your image URL
        pendingIcon: '/assets/chrismas.gif',      // Snowflake for pending
        dotStyle: 'border-radius: 50%; background: linear-gradient(45deg, #cc0000, #990000); box-shadow: 0 0 5px rgba(255,0,0,0.5);'
      },
      additionalCSS: `
        .snowflake {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 60px;
          height: 60px;
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          color: #fff;
        }
        .stamp.active {
          box-shadow: 0px 0px 8px rgba(255, 215, 0, 0.6);
        }
      `,
    },
  ];

  constructor() { }

  // Load template data from JSON
  async loadJSON(): Promise<any> {
    try {
      const response = await fetch('assets/test.json');
      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched JSON:", data);
      return data;
    } catch (error) {
      console.error("Error fetching JSON:", error);
      return null;
    }
  }

  public formatDate = (date: any): string => {
    if (!date) return 'N/A'; // Handle missing date
    try {
      const d = new Date(date);

      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }); // Example output: "Mar 1, 2024"
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };


  // Extract card data with default values
  private extractCardData(data: any): CardData {


    if (!data) {
      return {
        cardID: 'Unknown',
        totalSpend: 0,
        eventID: 'N/A',
        eventMinSpend: 0,
        stampCollected: [],
        publicName: 'Stamp Card',
        startDate: this.formatDate(data.startDate), // Now it's already formatted as YYYY-MM-DD
        endDate: this.formatDate(data.endDate),
        desc: 'Good',
        rewards: [], // Empty rewards array
      };
    }

    return {
      cardID: data.cardID || 'Unknown',
      totalSpend: data.totalSpend || 0,
      eventID: data.eventID || 'N/A',
      eventMinSpend: data.eventMinSpend || 0,
      stampCollected: Array.isArray(data.stampCollected) ? data.stampCollected : [],
      publicName: data.publicName || 'Stamp Card',
      startDate: this.formatDate(data.startDate) ? this.formatDate(new Date(data.startDate)) : null,  // Convert properly
      endDate: this.formatDate(data.endDate) ? this.formatDate(new Date(data.endDate)) : null,
      desc: data.desc || 'Good',
      rewards: Array.isArray(data.rewards) ? data.rewards : []
    };
  }

  // Get a template by ID
  public getTemplateById(templateId: string): StampTemplate {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      console.error(`Template with ID '${templateId}' not found.`);
      return this.templates[0]; // Return default template as fallback
    }
    return template;
  }

  // Generate a template by ID
  async generateTemplate(editor: any, templateId: string): Promise<void> {
    if (!editor) {
      console.error("Error: 'editor' is not initialized");
      return;
    }

    try {
      const data = await this.loadJSON();
      if (!data) {
        console.error("Error: No data found in JSON");
        return;
      }

      const cardData = this.extractCardData(data);
      const template = this.getTemplateById(templateId);

      editor.setComponents(""); // Clear previous content
      this.applyTemplateStyles(editor, template);
      this.buildCardHTML(editor, template, cardData);

    } catch (error) {
      console.error(`Error in generateTemplate (${templateId}):`, error);
    }
  }

  // Apply template styles to editor
  private applyTemplateStyles(editor: any, template: StampTemplate): void {
    const { cardStyle, stampStyle, rewardStyle, backgroundImage, additionalCSS } = template;

    const baseCSS = `
      body {
        background-image: url('${backgroundImage}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px 0;  /* Add padding to ensure spacing */
        color: white;
      }
      .card {
        width: 350px;
        background: ${cardStyle.background};
        padding: 20px;
        border-radius: 10px;
        box-shadow: ${cardStyle.boxShadow};
        text-align: center;
        border: 3px solid ${cardStyle.borderColor};
        color: white;
        margin: 20px 0;  /* Add margin to ensure spacing */
      }
      .stamp-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 10px;
        border: 2px solid ${cardStyle.borderColor};
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
      }
      .stamp {
        width: 50px;
        height: 50px;
        margin: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        font-weight: bold;
      }
      .stamp.active {
        background: ${stampStyle.activeBackground};
        color: white;
        border: ${stampStyle.activeBorder || `2px solid ${cardStyle.borderColor}`};
      }
      .stamp.inactive {
        background: transparent;
        color: ${stampStyle.inactiveColor};
        border: ${stampStyle.inactiveBorder};
      }
      .stamp-icon {
        width: 40px;
        height: 40px;
      }

      #rewardSection {
      margin-top: 20px;
    }
    .reward-container {
      background: ${rewardStyle?.background || 'rgba(255, 255, 255, 0.1)'};
      border: 2px solid ${rewardStyle?.borderColor || cardStyle.borderColor};
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
    }
    .reward-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      margin-bottom: 8px;
      border-radius: 8px;
      background: white;
      color: black;
      position: relative;
    }
    .reward-dot {
      width: 12px;
      height: 12px;
      margin-right: 15px;
      border-radius: 50%;
    }
    
    /* Template-specific dot styles */
    .hariraya-dot {
      ${rewardStyle?.dotStyle || 'border-radius: 50%;'}
    }
    .cny-dot {
      ${rewardStyle?.dotStyle || 'border-radius: 50%;'}
    }
    .christmas-dot {
      ${rewardStyle?.dotStyle || 'border-radius: 50%;'}
    }
    
    .reward-item.granted .reward-dot {
      background-color: ${rewardStyle?.activeBadge || '#ff4444'};
    }
    .reward-item.pending .reward-dot {
      background-color: ${rewardStyle?.inactiveBadge || '#999999'};
    }
    .reward-description {
      flex: 1;
      font-weight: bold;
      font-size: 14px;
      text-align: left;
    }
    .reward-status {
      font-size: 20px;
    }
.reward-badge {
  display: inline-block;
  background: ${rewardStyle?.inactiveBadge || '#999999'};
  color: white;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
}
    .reward-item.granted .reward-badge {
      background: ${rewardStyle?.activeBadge || '#ff4444'};
    }

    .reward-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
      ${additionalCSS || ''}
    `;

    editor.setStyle(baseCSS);
  }

  // Build card HTML and add to editor
  private buildCardHTML(editor: any, template: StampTemplate, cardData: CardData): void {
    const { icons, name } = template;

    let cardHTML = `<div class="card">`;

    // Add decoration if available
    if (icons.decoration) {
      const { src, className, style } = icons.decoration;
      cardHTML += `<img src="${src}" class="${className}" ${style ? `style="${style}"` : ''} alt="decoration">`;
    }

    // Add card header content
    cardHTML += `
      <h1 class="publicName">${cardData.publicName || name}</h1>
      <h2>Describe: <span class="publicDescription">${cardData.desc}</span></h2>
      <p><strong>Total Spend:</strong> RM${cardData.totalSpend}</p>
      <p><strong>Event ID:</strong> ${cardData.eventID}</p>
      <p><strong>Min Spend:</strong> RM${cardData.eventMinSpend}</p>
      <p><strong>Duration:</strong> <span class="eventStartDate">${cardData.startDate}</span> - <span class="eventEndDate">${cardData.endDate}</span></p>
      <div id="stampSection">
    `;

    // Add stamps section
    if (Array.isArray(cardData.stampCollected) && cardData.stampCollected.length > 0) {
      const countC = cardData.stampCollected.filter(stamp => stamp === "c").length;
      cardHTML += `
        <h2>Stamp Progress: ${countC} / ${cardData.stampCollected.length}</h2>
        <div class="stamp-container">
      `;

      cardData.stampCollected.forEach((stamp) => {
        const stampClass = stamp === "c" ? "active" : "inactive";
        cardHTML += `
          <div class="stamp ${stampClass}">
            <img src="${icons.stamp}" alt="stamp" class="stamp-icon">
          </div>
        `;
      });




      cardHTML += `</div>`;
    } else {
      cardHTML += `<p>No stamps collected yet.</p>`;
    }

    // Add rewards section
    if (template.rewardStyle && Array.isArray(cardData.rewards) && cardData.rewards.length > 0) {
      cardHTML += `
              <div id="rewardSection">
                <h2>Rewards</h2>
                <div class="reward-container">
            `;

      cardData.rewards.forEach((reward) => {
        const isGranted = reward.granted;
        const statusClass = isGranted ? 'granted' : 'pending';
        const iconUrl = isGranted
          ? template.rewardStyle.grantedIcon || '/assets/default-granted.gif'
          : template.rewardStyle.pendingIcon || '/assets/default-pending.gif';

        cardHTML += `
                <div class="reward-item ${statusClass}">
                  <div class="reward-dot ${template.id}-dot"></div>
                  <div class="reward-description">${reward.description}
                  <span class="reward-badge">${reward.requiredStamps >= 1 ? `×${reward.requiredStamps}` : ''}</span>
                  </div>
                      <div class="reward-status">
      <img src="${iconUrl}" alt="${isGranted ? 'Granted' : 'Pending'}" class="reward-icon" />
    </div>
                </div>
              `;
      });

      cardHTML += `
                </div>
              </div>
            `;
    }
    cardHTML += `</div></div>`; // Close #stampSection and .card

    // Add the card to the editor
    editor.addComponents(cardHTML);
  }

  // Update stamp section for any template
  async updateStampSection(editor: any, templateId: string): Promise<void> {
    if (!editor) {
      console.error("Error: 'editor' is not initialized");
      return;
    }

    try {
      const data = await this.loadJSON();
      if (!data) {
        console.error("Error: No data found in JSON");
        return;
      }

      const { stampCollected } = data;
      const stampSection = editor.getWrapper().find('#stampSection')[0];
      const template = this.getTemplateById(templateId);

      if (stampSection) {
        let stampHTML = '';

        if (Array.isArray(stampCollected) && stampCollected.length > 0) {
          const countC = stampCollected.filter(stamp => stamp === "c").length;
          stampHTML += `
            <h2>Stamp Progress: ${countC} / ${stampCollected.length}</h2>
            <div class="stamp-container">
          `;

          stampCollected.forEach((stamp) => {
            const stampClass = stamp === "c" ? "active" : "inactive";
            stampHTML += `
              <div class="stamp ${stampClass}">
                <img src="${template.icons.stamp}" alt="stamp" class="stamp-icon">
              </div>
            `;
          });

          stampHTML += `</div>`;
        } else {
          stampHTML += `<p>No stamps collected yet.</p>`;
        }

        // Apply the new stamp content
        stampSection.components(stampHTML);
      }
    } catch (error) {
      console.error(`Error in updateStampSection (${templateId}):`, error);
    }
  }

  async updateRewardSection(editor: any, templateId: string): Promise<void> {
    if (!editor) {
      console.error("Error: 'editor' is not initialized");
      return;
    }

    try {
      const data = await this.loadJSON();
      if (!data) {
        console.error("Error: No data found in JSON");
        return;
      }

      const { rewards } = data;
      const rewardSection = editor.getWrapper().find('#rewardSection')[0];
      const template = this.getTemplateById(templateId);

      if (rewardSection && template.rewardStyle) {
        let rewardHTML = `<h2>Rewards</h2><div class="reward-container">`;

        if (Array.isArray(rewards) && rewards.length > 0) {
          rewards.forEach((reward) => {
            const isGranted = reward.granted;
            const statusClass = isGranted ? 'granted' : 'pending';
            const iconUrl = isGranted
              ? template.rewardStyle.grantedIcon || '/assets/default-granted.gif'
              : template.rewardStyle.pendingIcon || '/assets/default-pending.gif';


            rewardHTML += `
              <div class="reward-item ${statusClass}">
                <div class="reward-badge">${reward.requiredStamps > 1 ? `×${reward.requiredStamps}` : ''}</div>
                <div class="reward-dot ${template.id}-dot"></div>
                <div class="reward-description">${reward.description}</div>
                    <div class="reward-status">
      <img src="${iconUrl}" alt="${isGranted ? 'Granted' : 'Pending'}" class="reward-icon" />
    </div>
              </div>
            `;
          });
        } else {
          rewardHTML += `<p>No rewards available.</p>`;
        }

        rewardHTML += `</div>`;

        // Apply the new reward content
        rewardSection.components(rewardHTML);
      }
    } catch (error) {
      console.error(`Error in updateRewardSection (${templateId}):`, error);
    }
  }

  //#region Template
  // Convenience methods for specific templates
  async generateDefaultTemplate(editor: any): Promise<void> {
    return this.generateTemplate(editor, 'hariraya');
  }

  async generateCnyTemplate(editor: any): Promise<void> {
    return this.generateTemplate(editor, 'cny');
  }

  async generateChristmasTemplate(editor: any): Promise<void> {
    return this.generateTemplate(editor, 'christmas');
  }
  //#endregion

  //#region Stamp
  async updateHariRayaStampSection(editor: any): Promise<void> {
    return this.updateStampSection(editor, 'hariraya');
  }

  async updateCNYStampSection(editor: any): Promise<void> {
    return this.updateStampSection(editor, 'cny');
  }

  async updateChristmasStampSection(editor: any): Promise<void> {
    return this.updateStampSection(editor, 'christmas');
  }
  //#endregion

  //#region Rewards
  async updateHariRayaRewards(editor: any): Promise<void> {
    console.log("Hari Raya Rewards");
    return this.updateRewardSection(editor, 'hariraya');
  }

  async updateCNYRewards(editor: any): Promise<void> {
    console.log("Chinese New Year Rewards");
    return this.updateRewardSection(editor, 'cny');
  }

  async updateChristmasRewards(editor: any): Promise<void> {
    console.log("Christmas Rewards");
    return this.updateRewardSection(editor, 'christmas');
  }

  //#endregion

  // Method to get all available template IDs
  getAllTemplateIds(): string[] {
    return this.templates.map(template => template.id);
  }

  // Method to get all templates
  getAllTemplates(): StampTemplate[] {
    return [...this.templates];
  }
}