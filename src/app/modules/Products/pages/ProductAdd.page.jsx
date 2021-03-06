import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
// import { ErrorMessage } from '@hookform/error-message'
import ImageInput from '../../../components/global/form/imageInput.component'
import { FormControl } from 'react-bootstrap'
import InputField from '../../../components/global/fields/Input.field'
import SelectField from '../../../components/global/fields/Select.field'
import ProductService from '../service/Product.service'
import firebase from '../../../../firebase/config'
import CategoryService from 'app/modules/Categories/service/Category.service'

function ProductAddPage() {
  const history = useHistory()
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit
  } = useForm()
  const onHandSubmit = async (data) => {
    const file = data.image[0]
    console.log(file)
    let storageRef = firebase.storage().ref(`images/${file.name}`)
    storageRef
      .put(file)
      .then(() => {
        storageRef.getDownloadURL().then(async (url) => {
          // console.log(url);
          const newData = {
            ...data,
            image: url
          }
          console.log(newData)
          await ProductService.store(newData)
          history.push('/product/list')
        })
      })
      .catch((err) => console.log('erorr', err))
  }

  const [categories, setCategories] = useState([]) // 1
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

  var today = new Date()
  var date = today.toJSON()
  console.log(date)
  const [listproduct, setListProduct] = useState([])

  const [existed, setExisted] = useState(false)
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
  return (
    <div className="card card-custom gutter-b">
      <div className="d-flex flex-column-fluid">
        <div className="container">
          <div className="card card-custom gutter-b">
            <div className="card-header">
              <div className="card-title">
                <h3 className="card-label">Th??m s???n ph???m</h3>
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
                              const check = listproduct.find(i => i.name.toLowerCase() === e.target.value.trim().toLowerCase())
                              setExisted(!!check)
                            }}
                            ref={register({
                              required: true,
                              maxLength: 255
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
                            max="2023-12-31"
                            className="form-control mb-4"
                            name="expiration_date"
                            defaultValue="0000-00-00"
                            ref={register({
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
                          <label>Gi???m gi?? ( % )</label>
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
                    <div class="form-group">
                      <input
                        type="file"
                        class="form-control"
                        name="image"
                        ref={register({
                          required: true,
                          maxLength: 255
                        })}
                        error={errors.image}
                      />
                      {errors.image && (
                        <div className="feedback mt-3">
                          Ch???n ???nh <b>kh??ng qu?? 255 k?? t???</b>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Chi ti???t ng???n</label>

                    <textarea
                      placeholder="m?? t??? ng???n"
                      name="desc_short"
                      className="form-control"
                      ref={register({
                        required: true
                      })}
                      label="Nh???p t??n"
                      error={errors.desc_short}
                    />
                    {errors.desc_short && (
                      <div className="feedback mt-3 text-danger">
                        H??y nh???p <b>m?? t??? nh???n</b>
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
                        required: true
                      })}
                      error={errors.description}
                    />
                    {errors.description && (
                      <div className="feedback mt-3 text-danger">
                        H??y nh???p <b>m?? t??? chi ti???t</b>
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

export default ProductAddPage
