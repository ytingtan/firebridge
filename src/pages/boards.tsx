import NavBar from "../components/NavBar"
import Layout from "../components/Layout"
import dynamic from 'next/dynamic'
import { EmailPasswordAuth } from 'supertokens-auth-react/recipe/emailpassword'
import { AppShell } from '@mantine/core'
import Session from 'supertokens-auth-react/recipe/session'
import { ContractLevel, DealType } from "../utils/enums"
import { useState, useMemo } from "react"
import React from 'react'
import { AgGridReact } from 'ag-grid-react'
import { LicenseManager } from 'ag-grid-enterprise'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import _, { isString } from 'lodash'
import axios from 'axios'
Session.addAxiosInterceptors(axios)
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE!)

const EmailPasswordAuthNoSSR = dynamic(
  new Promise<typeof EmailPasswordAuth>((res) =>
    res(EmailPasswordAuth)
  ),
  { ssr: false }
)

const Boards = () => {

  let pageStates = ['']

  let nextPageData: any[] = []
  let nextPageLoading = false

  const wait = (seconds: number) => 
   new Promise(resolve => 
      setTimeout(() => resolve(true), seconds * 1000)
   )

  const [gridApi, setGridApi] = useState<any>(null)

  var filterParams = {
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
      var dateAsString = cellValue;
      if (dateAsString == null) return -1;
      var dateParts = dateAsString.split('-');
      var cellDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]),
        Number(dateParts[2])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },
    browserDatePicker: true,
    minValidYear: 2022,
    maxValidYear: 2022,
  };

  const columns = [
    { headerName: "Date", field: 'date', filter: "agDateColumnFilter", filterParams: filterParams, cellRenderer:'loading', width: 115 },
    { headerName: "Contract", field: "contract", width: 110 },
    { headerName: "Deal Type", field: "deal_type", filter: "agSetColumnFilter",
      filterParams: {
        values: ['Passout', 'Lead', 'Dummy', 'Defence', 'Declaring']
      },
      width: 115
    },
    { headerName: "Contract Level", field: "contract_level", filter: "agSetColumnFilter",
      filterParams: {
        values: ['Passout', 'Partial', 'Game', 'Slam', 'Grand Slam']
      },
      width: 115
    },
    { headerName: "Competitive", field: 'competitive', filter: "agSetColumnFilter",
      filterParams: {
        values: ['Yes', 'No']
      },
      width: 130
    },
    { headerName: "Optimal Points", field: "optimal_points", filter: "agNumberColumnFilter", width: 110 },
    { headerName: "Tricks From Optimal", field: 'tricks_diff', filter: "agNumberColumnFilter", width: 110 },
    { headerName: "Tricks Over Contract", field: 'tricks_over_contract', filter: "agNumberColumnFilter", width: 110 },
    { headerName: "Lead Cost", field: 'lead_cost', filter: "agNumberColumnFilter", width: 90 },
    { headerName: "IMPs From Optimal", field: 'imps_diff', filter: "agNumberColumnFilter", width: 110 },
    { headerName: "Points From Optimal", field: 'points_diff', filter: "agNumberColumnFilter", width: 110 },
  ]
  const datasource = {
    async getRows(params: any) {
      console.log(JSON.stringify(params, null, 1))
      const { startRow, filterModel } = params
      let url = `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/boards/getboards?`
      //Filtering
      const filterKeys = Object.keys(filterModel)
      if (filterKeys.length && startRow === 0) {
        pageStates = ['']
        nextPageData = []
        nextPageLoading = false
      }
      if (filterKeys.includes('competitive') && filterModel['competitive'].values.some((value: any) => isString(value))) {
        filterModel['competitive'].values = filterModel['competitive'].values.map((value: string) => value === 'Yes')
      }
      if (filterKeys.includes('deal_type') && filterModel['deal_type'].values.some((value: any) => isString(value))) {
        filterModel['deal_type'].values = filterModel['deal_type'].values.map((value: string) => 
          Object.keys(DealType).filter((v) => isNaN(Number(v))).indexOf(_.toUpper(_.snakeCase(value)))
        )
      }
      if (filterKeys.includes('contract_level') && filterModel['contract_level'].values.some((value: any) => isString(value))) {
        filterModel['contract_level'].values = filterModel['contract_level'].values.map((value: string) => 
          Object.keys(ContractLevel).filter((v) => isNaN(Number(v))).indexOf(_.toUpper(_.snakeCase(value)))
        )
      }
      filterKeys.forEach(filter => {
        if (filterModel[filter].filterType === 'number') {
          switch (filterModel[filter].type) {
            case 'inRange':
              url += `${filter}=gte:${filterModel[filter].filter}&${filter}=lte:${filterModel[filter].filterTo}&`
              break
            case 'equals':
              url += `${filter}=eq:${filterModel[filter].filter}&`
              break
            case 'lessThanOrEqual':
              url += `${filter}=lte:${filterModel[filter].filter}&`
              break
            case 'greaterThanOrEqual':
              url += `${filter}=gte:${filterModel[filter].filter}&`
              break
          }
        } else if (filterModel[filter].filterType === 'date') {
          switch (filterModel[filter].type) {
            case 'inRange':
              url += `${filter}=gte:${filterModel[filter].dateFrom.slice(0, 10)}&${filter}=lte:${filterModel[filter].dateTo.slice(0, 10)}&`
              break
            case 'equals':
              url += `${filter}=eq:${filterModel[filter].dateFrom.slice(0, 10)}&`
              break
            case 'lessThanOrEqual':
              url += `${filter}=lte:${filterModel[filter].dateFrom.slice(0, 10)}&`
              break
            case 'greaterThanOrEqual':
              url += `${filter}=gte:${filterModel[filter].dateFrom.slice(0, 10)}&`
              break
          }
        } else {
          url += `${filter}=in:${filterModel[filter].values}&`
        }
      })
      //Pagination
      if (nextPageLoading) {
        if (await wait(1) && nextPageLoading) {
          if (await wait(1) && nextPageLoading) {
            if (await wait(1) && nextPageLoading) {
              nextPageData = []
              nextPageLoading = false
            }
          }
        }
      }
      if (nextPageData.length > 0) {
        if (startRow / 100 !== pageStates.length - 1) {
          nextPageLoading = true
          axios.get(url, { params: { page: pageStates[pageStates.length - 1] } })
            .then(response => {
              if (!pageStates.includes(response.data.pageState) && response.data.pageState !== null) {
                pageStates.push(response.data.pageState)
              }
              let json = response.data.values.map((row: any) => {
                return {
                  ...row,
                  date: row.timestamp.slice(0, 10),
                  competitive: row.competitive ? 'Yes' : 'No',
                  deal_type: _.startCase(_.lowerCase(DealType[row.deal_type])),
                  contract_level: _.startCase(_.lowerCase(ContractLevel[row.contract_level]))
                }})
              nextPageData = json
              nextPageLoading = false
            })
            .catch(error => {
              console.error(error)
              nextPageLoading = false
            })
          params.successCallback(nextPageData)
        } else {
          params.successCallback(nextPageData, startRow + nextPageData.length)
        }
        nextPageData = []
      } else {
        axios.get(url, pageStates[startRow / 100] === '' ? undefined : { params: { page: pageStates[startRow / 100] }})
          .then(response => {
            if (!pageStates.includes(response.data.pageState) && response.data.pageState !== null) {
              pageStates.push(response.data.pageState)
              nextPageLoading = true
              axios.get(url, { params: { page: pageStates[pageStates.length - 1] }})
                .then(response => {
                  if (!pageStates.includes(response.data.pageState) && response.data.pageState !== null) {
                    pageStates.push(response.data.pageState)
                  }
                  let json = response.data.values.map((row: any) => {
                    return {
                      ...row,
                      date: row.timestamp.slice(0, 10),
                      competitive: row.competitive ? 'Yes' : 'No',
                      deal_type: _.startCase(_.lowerCase(DealType[row.deal_type])),
                      contract_level: _.startCase(_.lowerCase(ContractLevel[row.contract_level]))
                    }})
                  nextPageData = json
                  nextPageLoading = false
                })
                .catch(error => {
                  console.error(error)
                  nextPageLoading = false
                })
            }
            let json = response.data.values.map((row: any) => {
              return {
                ...row,
                date: row.timestamp.slice(0, 10),
                competitive: row.competitive ? 'Yes' : 'No',
                deal_type: _.startCase(_.lowerCase(DealType[row.deal_type])),
                contract_level: _.startCase(_.lowerCase(ContractLevel[row.contract_level]))
              }})
            if (response.data.pageState !== null) {
              params.successCallback(json)
            } else {
              params.successCallback(json, startRow + response.data.values.length)
            }
            if (response.data.count !== null) {
              gridApi.api.setRowCount(response.data.count, false)
            }
          })
          .catch(error => {
            console.error(error)
            params.failCallback()
          })
      }
    }
  }

  const getRowId = (params: any) => params.data.deal_id
  
  const onGridReady = (params: any) => {
    setGridApi(params)
    // register datasource with the grid
    params.api.setDatasource(datasource)
  }

  const components = {
    loading: (params: any) => {
      if (params.value!==undefined) {
        return params.value
      } else {
        return <img src='https://www.ag-grid.com/example-assets/loading.gif' alt=''/>
      }
    }
  }

  const defaultColDef = useMemo(() => {
    return {
      filterParams: {
        filterOptions: [
          'equals', 'lessThanOrEqual', 'greaterThanOrEqual', 'inRange'
        ],
        buttons: ['apply', 'reset'],
        closeOnApply: true,
        suppressAndOrCondition: true
      },
      resizable: true,
      minWidth: 80,
      wrapHeaderText: true,
      autoHeaderHeight: true
    }
  }, [])

  const openBoard = (event: any) => {
    if (event.node.data !== undefined) {
      window.open(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/boards/getboard?id=${event.node.id}`, "_blank")
    }
  }

  return (
    <EmailPasswordAuthNoSSR>
      <Layout>
      <AppShell
        padding="md"
        fixed={false}
        navbar={<NavBar />}
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        })}
      >
        <h1> View past boards here. </h1>
        <div className="ag-theme-alpine" style={{height:800}}>
          <AgGridReact
            columnDefs={columns}
            pagination={true}
            // paginationPageSize={100}
            // domLayout="autoHeight"
            rowModelType="infinite"
            paginationAutoPageSize={true}
            onGridReady={onGridReady}
            getRowId={getRowId}
            onRowClicked={openBoard}
            components={components}
            defaultColDef={defaultColDef}
          />
        </div>
      </AppShell>
      </Layout>
    </EmailPasswordAuthNoSSR>
  )
}

export default Boards