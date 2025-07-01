import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { FileUploadDownloadService } from '../core/file-upload-download.service';
import { SaveData } from '../../model/core/saveData.type';

@Injectable({
  providedIn: 'root',
})
export class D201Service {
  http = inject(HttpClient);
  fileService = inject(FileUploadDownloadService);

  GetDataPlanData(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_PLANDATA}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataHeader(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_HEADERDATA}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataSop(Hmno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_SOPDATA}`;
    const body: any = {
      Hmno: Hmno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataChecklist(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_CHECKLISTDATA}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataMeasurement(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_MEASUREMENTDATA}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataChecklistImage(
    Planno: string,
    Proceseq: number,
    Seq: number
  ): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_CHECKLISTIMAGEDATA
    }`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
      Seq: Seq,
    };
    return this.http.post(url, body);
  }

  SaveDataChecklist(
    ChecklistDetails: SaveData,
    ChecklistImageDetails: SaveData,
    PlanHeaderDetails: any
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.SAVE_CHECKLISTDATA}`;
    const CheckListData: any = {
      PlanHeaderDetails: PlanHeaderDetails,
      ChecklistDetails: ChecklistDetails,
      ChecklistImageDetails: ChecklistImageDetails,
    };
    return this.http.post(url, CheckListData);
  }

  SaveDataStatus(
    headerData: any,
    Processingevent: string,
    Formid: string,
    Userid: string,
    Programnm: string
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.SAVE_STATUSDATA}`;
    const body: any = {
      Processingevent: Processingevent,
      Planno: headerData.Planno,
      Proceseq: Number(headerData.Proceseq),
      Workseq: headerData.Workseq,
      Chargecd: headerData.Chargecd,
      Workkbn: '0',
      State: headerData.State,
      Shokouteiflg: headerData.Shokouteiflg,
      Lastkouteiflg: headerData.Lastkouteiflg,
      Formid: Formid,
      Userid: Userid,
      Programnm: Programnm,
      Updtdt_D_PLAN101: headerData.Updtdt_D_PLAN101,
      Updtdt_D_PLAN102: headerData.Updtdt_D_PLAN102,
      Updtdt_D_MFG001: headerData.Updtdt_D_MFG001,
    };
    return this.http.post(url, body);
  }

  SaveDataMeasurement(
    MeasurementDetails: SaveData,
    MeasurementImageDetails: SaveData
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.SAVE_MEASUREMENTDATA}`;
    const MeasurementData: any = {
      MeasurementDetails: MeasurementDetails,
      MeasurementImageDetails: MeasurementImageDetails,
    };
    return this.http.post(url, MeasurementData);
  }

  GetDataMeasurementImage(
    Planno: string,
    Proceseq: number
  ): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_MEASUREMENTIMAGEDATA
    }`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq
    };
    return this.http.post(url, body);
  }

  InputItemDataList(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_INPUTITEMDATA}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
    };
    return this.http.post(url, body);
  }

  GetDataResultReference(Planno: string, Proceseq: number, Workseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_RESULTREFERENCE}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
      Workseq: Workseq,
    };
    return this.http.post(url, body);
  }

  GetDataResultSiyoReference(Planno: string, Proceseq: number, Goodqty: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_RESULTSIYOREFERENCE}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq,
      Goodqty: Goodqty,
    };
    return this.http.post(url, body);
  }

  AddInputItemDataList(InputItemDataList: SaveData): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.SAVE_INPUTITEMDATA}`;
    return this.http.post(url, InputItemDataList);
  }

  GetDataReferenceResultAll(Planno: string, Proceseq: number): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.GET_RESULTREFERENCEALL}`;
    const body: any = {
      Planno: Planno,
      Proceseq: Proceseq
    };
    return this.http.post(url, body);
  }

  SaveDataResultReference(
    Defectiveitems: SaveData,
    Useditems: SaveData,
    Manufacturingrecord: any,
    Headerdata: any
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.D201.SAVE_RESULTREFERENCE}`;
    const CheckListData: any = {
      Defectiveitems: Defectiveitems,
      Useditems: Useditems,
      Manufacturingrecord: Manufacturingrecord,
      Headerdata: Headerdata
    };
    return this.http.post(url, CheckListData);
  }
}
