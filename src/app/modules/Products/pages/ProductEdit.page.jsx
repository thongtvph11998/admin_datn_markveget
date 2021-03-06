import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import AppHelper from '../../../../helpers/app.helper'
import ProductService from '../service/Product.service'
import { DATA_LOAD_TIME } from '../../../../constants'
import SelectField from '../../../components/global/fields/Select.field'
import {
  DATATABLE_METADATA_DEFAULT,
  DATATABLE_OPTIONS_DEFAULT
} from '../../../components/global/datatable/datatable.constant'
import { useHistory, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import InputField from '../../../components/global/fields/Input.field'
import firebase from '../../../../firebase/config'
import CategoryService from 'app/modules/Categories/service/Category.service'
import Swal from 'sweetalert2'

function ProductEditPage() {
  const [options, setOptions] = useState(DATATABLE_OPTIONS_DEFAULT)
  const [loading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState(DATATABLE_METADATA_DEFAULT)
  const [product, setProduct] = useState([])
  const [listproduct, setListProduct] = useState([])

  const { id } = useParams()
  const history = useHistory()
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm()
  const loadProducts = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      ProductService.find(id).then((res) => {
        setImageChange(res.data.image)
        setProduct(res.data)
        reset(res.data)
        setLoading(false)
      })
    }, DATA_LOAD_TIME)
  }, [options])
  const [imageChange, setImageChange] = useState('')

  useEffect(() => {
    AppHelper.setTitle('Products')
    loadProducts()
  }, [options])

  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    let storageRef = firebase.storage().ref(`images/${file.name}`)
    storageRef
      .put(file)
      .then(() => {
        storageRef.getDownloadURL().then(async (url) => {
          setImageChange(url)
        })
      })
      .catch((err) => console.log('erorr', err))
  }
  const onHandSubmit = async (data) => {
    try {
      const newData = {
        ...data,
        image: imageChange
      }
      await ProductService.update(id, newData)
      history.push('/product/list')
    } catch (error) {
      console.log(error)
      Swal.fire(`Kh??ng c?? d??? li???u`)
    }
  }
  const [categories, setCategories] = useState([])
  useEffect(() => {
    const getCategories = async () => {
      try {
        const { data } = await CategoryService.list()

        setCategories(data)
      } catch (error) {
        console.log(error)
      }
    }
    getCategories()
  }, [])

  useEffect(() => {
    const getCategories = async () => {
      try {
        const { data } = await ProductService.list()

        setListProduct(data)
      } catch (error) {
        console.log(error)
      }
    }
    getCategories()
  }, [])
  var today = new Date()
  var date = today.toJSON()


  const [existed, setExisted] = useState(false)

  return (
    <div className="card card-custom gutter-b">
      <div className="d-flex flex-column-fluid">
        <div className="container">
          <div className="card card-custom gutter-b">
            <div className="card-header">
              <div className="card-title">
                <h3 className="card-label">S???a s???n ph???m</h3>
              </div>
              <div className="card-toolbar">
                <Link type="button" to="/product/list" className="btn btn-light">
                  <i className="fa fa-arrow-left" />
                  Tr??? l???i
                </Link>
              </div>
            </div>
            <div className="card-body">
              <ul className="nav nav-tabs nav-tabs-line " role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" data-toggle="tab" role="tab" aria-selected="true">
                    Th??ng tin
                  </a>
                </li>
              </ul>
              <div className="mt-5">
                <form onSubmit={handleSubmit(onHandSubmit)} className="form form-label-right">
                  <div className="form-group row">
                    <div className="col-lg-8">
                      <div className="row mb-5">
                        <div className="col-lg-6">
                          <label>T??n s???n ph???m</label>
                          <InputField
                            id="name"
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="T??n"
                            onChange={e => {
                              const check = listproduct.find(i => i.name.toLowerCase() === e.target.value.trim().toLowerCase() && i.id != id)
                              setExisted(!!check)
                            }}
                            ref={register({
                              required: true,
                              maxLength: 255,

                            })}

                            error={errors.name}

                          />
                          {errors.name && (
                            <div className="feedback mt-3 text-danger">
                              H??y nh???p <b>t??n d?????i 255 k?? t???</b>
                            </div>
                          )}
                          {existed && (
                            <div className="feedback mt-3 text-danger">
                              s???n ph???m ???? t???n t???i
                            </div>
                          )}
                        </div>
                        <div className="col-lg-6">
                          <label>Ch???n danh m???c</label>
                          <select className="form-control form-control-solid" name="cate_id" ref={register}>
                            {categories.map((category, index) => (
                              <option value={`${category.id}`} key={index}>
                                {' '}
                                {category.name}{' '}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="row mb-5">
                        <div className="col-lg-6">
                          <label>Nh???p gi??</label>
                          <input
                            type="number"
                            className="form-control"
                            name="price"
                            placeholder="Gi??"
                            ref={register({
                              required: true,
                              max: 100000000,
                              min: 0
                            })}
                            error={errors.price}
                          />
                          {errors.price && (
                            <div className="feedback mt-3 text-danger">
                              H??y ch???n <b>gi?? trong kho???ng 0 - 100.000.000</b>
                            </div>
                          )}
                        </div>

                        <div className="col-lg-6">
                          <label>Nh???p tr???ng th??i</label>
                          <select
                            defaultValue="1"
                            className="form-control form-control-solid"
                            name="status"
                            ref={register}
                          >
                            <option value="1">C??n h??ng</option>
                            <option value="0">H???t h??ng</option>
                          </select>
                        </div>
                        <div className="col-lg-6 mt-2">
                          <label>Nh???p ng??y h???t h???n</label>
                          <InputField
                            id="expiration_date"
                            type="date"
                            min="2021-01-01"
                            className="form-control mb-4"
                            name="expiration_date"
                            ref={register({
                              required: true,
                              validate: (expiration_date) => expiration_date > date
                            })}
                            error={errors.expiration_date}
                          />
                          {errors.expiration_date && (
                            <div className="feedback mt-3 text-danger">
                              H??y ch???n <b>ng??y h???t h???n </b>
                            </div>
                          )}
                        </div>
                        <div className="col-lg-6">
                          <label>Gi???m gi??</label>
                          <input
                            type="number"
                            className="form-control"
                            name="sale"
                            placeholder="Gi???m gi??"
                            defaultValue="0"
                            ref={register({
                              validate: (sale) => sale >= 0 && sale < 100
                            })}
                            error={errors.sale}
                          />
                          {errors.sale && (
                            <div className="feedback mt-3">
                              Gi???m gi?? <b>kh??ng ???????c d?????i 0 % v?? l???n h??n 100 %</b>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <img className="mb-3" src={product.image} width="240px" />
                    <input type="file" class="form-control" name="image" onChange={handleChangeImage} />
                  </div>
                  <div className="form-group">
                    <label>Chi ti???t ng???n</label>

                    <textarea
                      placeholder="m?? t??? ng???n"
                      name="desc_short"
                      className="form-control"
                      ref={register({
                        required: true,
                      })}
                      label="Nh???p t??n"
                      error={errors.desc_short}
                    />
                    {errors.desc_short && (
                      <div className="feedback mt-3 text-danger">
                        H??y nh???p <b>m?? t??? ng???n</b>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Chi ti???t</label>
                    <textarea
                      placeholder="m?? t??? chi ti???t"
                      name="description"
                      className="form-control"
                      ref={register({
                        required: true,
                      })}
                      error={errors.description}
                    />
                    {errors.description && (
                      <div className="feedback mt-3 text-danger">
                        H??y nh???p <b>m?? t??? chi ti???t </b>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary">
                    L??u
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductEditPage
