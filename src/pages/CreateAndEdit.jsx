import axios from 'axios'
import { useFormik } from 'formik'
import { useCallback, useEffect } from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import CustomSelect from '../component/ui/CustomSelect'

const CreateAndEdit = () => {
  const positionOptions = [
    { value: 'DEV', label: 'DEV' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Khác', label: 'Khác' }
  ]
  const salaryBasicOptions = [
    {
      value: 4960000,
      label: `${(4960000).toLocaleString('vi-VN')} ₫`,
    },
    {
      value: 4420000,
      label: `${(4420000).toLocaleString('vi-VN')} ₫`,
    },
  ]
  const match = useMatch('/admin/employee/:id')
  const isEdit = !!match
  console.log('isEdit', isEdit)
  const navigate = useNavigate()
  const employeeInfo = useFormik({
    enableReinitialize: isEdit,
    initialValues: {
      "maNhanVien": "",
      "tenNhanVien": "",
      "chucVu": "",
      "heSoChucVu": "",
      "luongCoBan": "",
      "soGioLamTrongThang": ""
    },
    validate: (values) => {
      const errors = {};

      if (!String(values.maNhanVien).trim()) {
        errors.maNhanVien = "Vui lòng nhập mã nhân viên";
      }

      const fullName = String(values.tenNhanVien ?? "").trim()
      if (fullName.split(/\s+/).filter(Boolean).length < 2) {
        errors.tenNhanVien = "Vui lòng nhập họ và tên đầy đủ (ít nhất 2 từ)";
      }

      if (!values.chucVu) {
        errors.chucVu = "Vui lòng chọn chức vụ";
      }

      if (!Number.isInteger(Number(values.heSoChucVu)) || Number(values.heSoChucVu) <= 0) {
        errors.heSoChucVu = "Hệ số chức vụ phải là số nguyên lớn hơn 0";
      }

      if (!Number.isFinite(Number(values.luongCoBan)) || Number(values.luongCoBan) <= 0) {
        errors.luongCoBan = "Lương cơ bản phải lớn hơn 0";
      }

      if (!Number.isFinite(Number(values.soGioLamTrongThang)) || Number(values.soGioLamTrongThang) <= 0) {
        errors.soGioLamTrongThang =
          "Số giờ làm trong tháng phải lớn hơn 0";
      }

      return errors;
    },
    onSubmit: async (values, { setFieldError }) => {
      const baseUrl = 'https://apitraining.cybersoft.edu.vn/api/QuanLyNhanVienApi'
      let urlAPI = ''
      let method = ''
      

      // formik lưu lại giá trị cuối
      console.log('Giá trị cuối cùng:', values)

      if (isEdit) {
        //nếu là cập nhật thì đổi urlAPI và method tương ứng với update
        urlAPI = `${baseUrl}/CapNhatThongTinNhanVien?maNhanVien=${match?.params?.id}`
        method = 'put'
      }

      if (!isEdit) {
        urlAPI = `${baseUrl}/ThemNhanVien`;
        method = 'post'
        try {
          const employeesRes = await axios.get(
            'https://apitraining.cybersoft.edu.vn/api/QuanLyNhanVienApi/LayDanhSachNhanVien',
          )
          const isDuplicate = employeesRes.data.some(
            (employee) =>
              String(employee.maNhanVien).trim() ===
              String(values.maNhanVien).trim(),
          )

          if (isDuplicate) {
            setFieldError('maNhanVien', 'Mã nhân viên đã tồn tại')
            return
          }
        } catch (error) {
          console.log(error)
          alert('Không thể kiểm tra mã nhân viên. Vui lòng thử lại.')
          return
        }
      }

      //gọi API thêm sản phẩm hoặc update
      try {
        const payload = {
          ...values,
          maNhanVien: Number(values.maNhanVien),
          heSoChucVu: Number(values.heSoChucVu),
        }
        console.log('Payload gửi API:', payload)
        const res = await axios[method](urlAPI, payload)
        console.log(res.data)
        //nếu thành công
        alert('Lưu dữ liệu thành công')
        //chuyển hướng về tranh danh sách  
        navigate('/admin/employees')

      } catch (error) {
        console.log(error)
        alert('Lưu dữ liệu thất bại')
      }


    }
  })

  const getEmployeeDetailAPI = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://apitraining.cybersoft.edu.vn/api/QuanLyNhanVienApi/LayThongTinNhanVien?maNhanVien=${match?.params?.id}`)
      employeeInfo.setValues(res.data)
    } catch (error) {
      console.log(error)
    }
  }, [match?.params?.id])

  //gọi API khi giá trị id thay đổi
  useEffect(() => {
    if (isEdit) {
      getEmployeeDetailAPI()
    }
  }, [match?.params?.id])
  const handleInputChange = (event) => {
    employeeInfo.handleChange(event)
    // Hiển thị giá trị nhập vào input 
    console.log(event.target.name, event.target.value)
  }
  const showValidationErrors = employeeInfo.submitCount > 0

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}
          </h3>
          <p className="text-muted small mb-0">
            {isEdit
              ? 'Cập nhật thông tin nhân viên trong hệ thống'
              : 'Nhập thông tin để tạo hồ sơ nhân viên mới'}
          </p>
        </div>
        <Link to="/admin/employees" className="btn btn-outline-secondary">
          Quay lại danh sách
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <form onSubmit={employeeInfo.handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="maNhanVien" className="form-label fw-semibold">
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  className={`form-control${showValidationErrors && employeeInfo.errors.maNhanVien ? ' is-invalid' : ''}`}
                  id="maNhanVien"
                  name="maNhanVien"
                  placeholder="113*"
                  disabled={isEdit}
                  value={employeeInfo.values.maNhanVien}
                  onChange={handleInputChange}
                  onBlur={employeeInfo.handleBlur}
                />
                {showValidationErrors && employeeInfo.errors.maNhanVien && (
                  <div className="invalid-feedback d-block">
                    {employeeInfo.errors.maNhanVien}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="tenNhanVien" className="form-label fw-semibold">
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tenNhanVien"
                  name="tenNhanVien"
                  placeholder="Nguyễn Văn A"
                  value={employeeInfo.values.tenNhanVien}
                  onChange={employeeInfo.handleChange}
                  onBlur={employeeInfo.handleBlur}
                />
                {showValidationErrors && employeeInfo.errors.tenNhanVien && (
                  <p className="text-danger mb-0">{employeeInfo.errors.tenNhanVien}</p>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="chucVu" className="form-label fw-semibold">
                  Chức vụ
                </label>
                <CustomSelect
                  options={positionOptions}
                  value={employeeInfo.values.chucVu}
                  onValueChange={(value) => {
                    employeeInfo.setFieldValue('chucVu', value)
                    employeeInfo.setFieldTouched('chucVu', true)
                  }}
                  placeholder="Chọn chức vụ"
                />
                {showValidationErrors && employeeInfo.errors.chucVu && (
                  <p className="text-danger mb-0">{employeeInfo.errors.chucVu}</p>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="heSoChucVu" className="form-label fw-semibold">
                  Hệ số chức vụ
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="heSoChucVu"
                  name="heSoChucVu"
                  placeholder="Nhập hệ số chức vụ"
                  min="0"
                  step="1"
                  value={employeeInfo.values.heSoChucVu}
                  onChange={employeeInfo.handleChange}
                  onBlur={employeeInfo.handleBlur}
                />
                {showValidationErrors && employeeInfo.errors.heSoChucVu && (
                  <p className="text-danger mb-0">{employeeInfo.errors.heSoChucVu}</p>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="luongCoBan" className="form-label fw-semibold">
                  Lương cơ bản
                </label>
                <CustomSelect
                  options={salaryBasicOptions}
                  value={employeeInfo.values.luongCoBan}
                  onValueChange={(value) => {
                    employeeInfo.setFieldValue('luongCoBan', value)
                    employeeInfo.setFieldTouched('luongCoBan', true)
                  }}
                  placeholder="Chọn lương cơ bản"
                />
                {showValidationErrors && employeeInfo.errors.luongCoBan && (
                  <p className="text-danger mb-0">{employeeInfo.errors.luongCoBan}</p>
                )}
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="soGioLamTrongThang"
                  className="form-label fw-semibold"
                >
                  Số giờ làm trong tháng
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="soGioLamTrongThang"
                    name="soGioLamTrongThang"
                    placeholder="Nhập số giờ làm"
                    min="0"
                    value={employeeInfo.values.soGioLamTrongThang}
                    onChange={employeeInfo.handleChange}
                    onBlur={employeeInfo.handleBlur}
                  />
                  <span className="input-group-text">giờ</span>
                </div>
                {showValidationErrors && employeeInfo.errors.soGioLamTrongThang && (
                  <p className="text-danger mb-0">{employeeInfo.errors.soGioLamTrongThang}</p>
                )}
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="soGioLamTrongThang"
                  className="form-label fw-semibold"
                >
                  Giá tiền
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    inputMode='numeric'
                    placeholder="giá tiền"
                  />
                  <span className="input-group-text">giờ</span>
                </div>
                {showValidationErrors && employeeInfo.errors.soGioLamTrongThang && (
                  <p className="text-danger mb-0">{employeeInfo.errors.soGioLamTrongThang}</p>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Link to="/admin/employees" className="btn btn-light border">
                Hủy
              </Link>
              <button type="submit" className="btn btn-danger px-4">
                {isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAndEdit
