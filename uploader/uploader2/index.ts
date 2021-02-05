import { IInputs, IOutputs } from "./generated/ManifestTypes";
class EntityReference {
  // id: string;
  // typeName: string;
  constructor(public typeName: string, public id: string) {
    // this.id = id;
    // this.typeName = typeName;
  }
}
class AttachedFile implements ComponentFramework.FileObject {
  constructor(
    public annotationId: string,
    public fileName: string,
    public mimeType: string,
    public fileContent: string,
    public fileSize: number
  ) {}
}

interface FileNode {
  id: string;
  file: File;
}
export class uploader
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private Files: FileNode[] = [];
  private entityReference: EntityReference;
  private _context: ComponentFramework.Context<IInputs>;
  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    this.Files = [];
    this._context = context;
    this.entityReference = new EntityReference(
      (<any>context).page.entityTypeName,
      (<any>context).page.entityId
    );
    const UploadForm = this.CreateFormUploadDiv();
    container.appendChild(UploadForm);
  }
  private CreateFormUploadDiv = (): HTMLDivElement => {
    const UploadForm = document.createElement("div");
    const UploadLabel = document.createElement("label");
    UploadLabel.htmlFor = "file-upload";
    UploadLabel.id = "lbl-file-upload";
    UploadLabel.innerText = "Choose Files to Upload";
    const UploadInput = document.createElement("input");
    UploadInput.id = "file-upload";
    UploadInput.type = "file";
    UploadInput.multiple = true;
    UploadInput.addEventListener("change", this.handleBrowse);
    const DragDiv = document.createElement("Div");
    DragDiv.id = "watermarkdiv";
    DragDiv.className = "watermarkdiv";
    DragDiv.innerText = "or drop files here...";

    const catchedfileslist = document.createElement("ol");
    catchedfileslist.id = "catchedfileslist";
    let fileCatcher = this.createDiv("files-catcher", "files", [
      catchedfileslist,
    ]);

    const filesHolder = this.createDiv("file-holder", "", [
      DragDiv,
      fileCatcher,
    ]);

    const UploadButton = document.createElement("button");
    UploadButton.innerText = "Upload";
    UploadButton.className = "buttons";
    UploadButton.addEventListener("click", this.handleUpload);
    const ClearButton = document.createElement("button");
    ClearButton.innerText = "Reset";
    ClearButton.className = "buttons";
    ClearButton.addEventListener("click", this.handleReset);
    const leftDiv = this.createDiv("left-container", "left-container", [
      UploadLabel,
      UploadInput,
      UploadButton,
      ClearButton,
    ]);

    const rightDiv = this.createDiv("right-container", "right-container", [
      filesHolder,
    ]);
    rightDiv.addEventListener("dragover", this.FileDragHover);
    rightDiv.addEventListener("dragleave", this.FileDragHover);
    rightDiv.addEventListener("drop", this.handleBrowse);
    const mainContainer = this.createDiv("main-container", "main-container", [
      leftDiv,
      rightDiv,
    ]);
    UploadForm.appendChild(mainContainer);

    // UploadForm.appendChild(UploadLabel);
    // UploadForm.appendChild(UploadInput);
    // UploadForm.appendChild(DragDiv);
    // UploadForm.appendChild(UploadButton);
    // UploadForm.appendChild(ClearButton);
    return UploadForm;
  };
  private createDiv(
    divid: string,
    classname = "",
    childElements?: HTMLElement[]
  ): HTMLDivElement {
    let _div: HTMLDivElement = document.createElement("div");
    _div.id = divid;
    classname ? (_div.className = classname) : "";
    if (childElements != null && childElements?.length > 0) {
      childElements.forEach((child) => {
        _div.appendChild(child);
      });
    } // return crLableNInput();
    return _div;
  }

  //
  private handleBrowse = (e: any): void => {
    e.preventDefault();
    console.log("handleBrowse");
    console.log(e);
    var files = e.target.files || e.dataTransfer.files;
    if (files.length > 0) {
      this.addFiles(files);
    }
  };
  addFiles(files: FileList) {
    var counter = this.Files.length;
    if (counter > 0 || files.length > 0) {
      const filesDiv = this.$id("watermarkdiv") as HTMLDivElement;
      filesDiv.style.display = "none";
    }
    const fileList = this.$id("catchedfileslist") as HTMLOListElement;
    for (var i = 0; i < files.length; i++) {
      counter++;
      let nodetype = {} as FileNode;
      nodetype.id = "progress" + counter;
      nodetype.file = files[i];
      var fileNode = document.createElement("li");
      fileNode.className = "fileNode";
      const text = document.createTextNode(files[i].name);
      fileNode.appendChild(text);
      fileList.appendChild(fileNode);
      //fileNode.className = "individual-file";
      //this.$id("files-catcher").appendChild(fileNode);
      this.Files[this.Files.length] = nodetype;
    }
  }
  //handles post call to CRM
  private handleUpload = (e: any): void => {
    debugger;
    console.log("handleUpload");
    console.log(e);
    let files = this.Files;
    const valid = files && files.length > 0;
    if (!valid) {
      alert("Please select a file!");
      return;
    } else {
      for (let i = 0; i < files.length; i++) {
        const file = files ? files[i].file : "";
        if (file !== "") {
          this.toBase64String(file, (file: File, text: string) => {
            const type = file.type;
            // this.renderToPlayer(text, type);
            let notesEntity = new AttachedFile(
              "",
              file.name,
              type,
              text,
              file.size
            );
            this.addAttachments(notesEntity);
          });
        }
      }
      debugger;
      alert(`uploaded ${files.length} number of files as attachments`);
      this.clearAttachments();
    }
  };
  clearAttachments = (): void => {
    const fileList = document.getElementById("catchedfileslist") as any;
    if (fileList) {
      while (fileList.hasChildNodes()) {
        fileList.removeChild(fileList.firstChild);
      }
    }
    this.Files = [];
    this.$id("watermarkdiv").style.display = "block";
  };
  addAttachments = (file: AttachedFile): void => {
    debugger;
    var notesEntity: any = {};
    console.log(file);
    var fileContent = file.fileContent;
    fileContent = fileContent.substring(
      fileContent.indexOf(",") + 1,
      fileContent.length
    );
    notesEntity["documentbody"] = fileContent;
    notesEntity["filename"] = file.fileName;
    notesEntity["filesize"] = file.fileSize;
    notesEntity["mimetype"] = file.mimeType;
    notesEntity["subject"] = file.fileName;
    // notesEntity["notetext"] = "Attachments uploaded via PCF uploader";
    notesEntity["objecttypecode"] = this.entityReference.typeName;
    notesEntity[
      `objectid_${this.entityReference.typeName}@odata.bind`
    ] = `/${this.CollectionNameFromLogicalName(
      this.entityReference.typeName
    )}(${this.entityReference.id})`;
    let thisRef = this;

    // Invoke the Web API to creat the new record
    this._context.webAPI.createRecord("annotation", notesEntity).then(
      function (response: ComponentFramework.EntityReference) {
        // Callback method for successful creation of new record
        console.log(response);

        // Get the ID of the new record created
        notesEntity["annotationId"] = response.id;
        notesEntity["fileContent"] = file.fileContent;
        notesEntity["fileName"] = notesEntity["filename"];
        //this.renderToPlayer(file.fileContent, file.mimeType);
        console.log(`Uploaded !!${file.fileName}`);
      },
      function (errorResponse: any) {
        // Error handling code here - record failed to be created
        console.log(errorResponse);
        alert("Unable to uploaded video!!");
      }
    );
  };
  CollectionNameFromLogicalName = (entityLogicalName: string): string => {
    if (entityLogicalName[entityLogicalName.length - 1] != "s") {
      return `${entityLogicalName}s`;
    } else {
      return `${entityLogicalName}ies`;
    }
  };
  private toBase64String = (
    file: File,
    successFn: (file: File, body: string) => void
  ) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => successFn(file, reader.result as string);
    console.log(reader.result);
    return reader.result;
  };
  private $id = (id: string): any => {
    return document.getElementById(id);
  };
  //handles clearing all the uploaded files
  private handleReset = (e: any): void => {
    console.log("handleReset");
    console.log(e);
    this.clearAttachments();
  };

  private FileDragHover = (e: any): void => {
    e.stopPropagation();
    e.preventDefault();
    // e.target.className = e.type == "dragover" ? "hover" : "";
    console.log("dragover", e);
  };
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Add code to update control view
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {}
}
